import { ExponentialBackoff, type IDisposable, handleAll, retry } from 'cockatiel';

import { type QueueMessagePayload, type QueueChannel } from '../../../../../common/types/queue/queueChannel.js';
import { type QueueController } from '../../../../../common/types/queue/queueController.js';
import { type QueueHandler } from '../../../../../common/types/queue/queueHandler.js';
import { QueuePath } from '../../../../../common/types/queue/queuePath.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type SendGridService } from '../../../../../libs/sendGrid/services/sendGridService/sendGridService.js';
import {
  ResetPasswordEmail,
  type ResetPasswordEmailTemplateData,
} from '../../../application/emails/resetPasswordEmail.js';
import {
  VerificationEmail,
  type VerificationEmailTemplateData,
} from '../../../application/emails/verificationEmail.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';
import { EmailEventStatus } from '../../../domain/entities/emailEvent/types/emailEventStatus.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';
import { type EmailEventRepository } from '../../../domain/repositories/emailEventRepository/emailEventRepository.js';

interface ProcessEmailEventPayload {
  readonly data: EmailEvent;
  readonly eventName: string;
}

export class EmailQueueController implements QueueController {
  public constructor(
    private readonly emailEventRepository: EmailEventRepository,
    private readonly sendGridService: SendGridService,
    private readonly loggerService: LoggerService,
  ) {}

  private eventName = 'email';

  private retryPolicy = retry(handleAll, {
    backoff: new ExponentialBackoff({
      exponent: 2,
      initialDelay: 1000,
    }),
    maxAttempts: 3,
  });

  public getQueuePaths(): QueuePath[] {
    return [
      QueuePath.create({
        handler: this.processEmailEvent.bind(this) as unknown as QueueHandler,
        queuePath: this.eventName,
      }),
    ];
  }

  public getChannels(): QueueChannel[] {
    return [
      {
        getMessages: async (): Promise<QueueMessagePayload[]> => {
          const emailEvents = await this.emailEventRepository.findAllPending();

          return emailEvents.map((emailEvent) => ({
            data: emailEvent as unknown as Record<string, unknown>,
            eventName: this.eventName,
          }));
        },
      },
    ];
  }

  private async processEmailEvent(payload: ProcessEmailEventPayload): Promise<void> {
    const { data: emailEvent } = payload;

    let retryListener: IDisposable;

    switch (emailEvent.getEmailEventName()) {
      case EmailEventType.verifyEmail:
        const verificationEmail = new VerificationEmail({
          recipient: emailEvent.getRecipientEmail(),
          templateData: emailEvent.getPayload() as unknown as VerificationEmailTemplateData,
        });

        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: EmailEventStatus.processing,
        });

        retryListener = this.retryPolicy.onFailure((reason) => {
          this.loggerService.error({
            message: 'Failed to send verification email.',
            emailEventId: emailEvent.getId(),
            reason,
          });
        });

        try {
          await this.retryPolicy.execute(async () => {
            await this.sendGridService.sendEmail({
              toEmail: verificationEmail.getRecipient(),
              subject: verificationEmail.getSubject(),
              body: verificationEmail.getBody(),
            });

            this.loggerService.debug({
              message: 'Sent verification email.',
              emailEventId: emailEvent.getId(),
              recipient: emailEvent.getRecipientEmail(),
            });
          });
        } catch (error) {
          await this.emailEventRepository.updateStatus({
            id: emailEvent.getId(),
            status: EmailEventStatus.failed,
          });

          retryListener.dispose();

          throw error;
        }

        retryListener.dispose();

        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: EmailEventStatus.processed,
        });

        break;

      case EmailEventType.resetPassword:
        const resetPasswordEmail = new ResetPasswordEmail({
          recipient: emailEvent.getRecipientEmail(),
          templateData: emailEvent.getPayload() as unknown as ResetPasswordEmailTemplateData,
        });

        retryListener = this.retryPolicy.onFailure((reason) => {
          this.loggerService.error({
            message: 'Failed to send reset password email.',
            emailEventId: emailEvent.getId(),
            reason,
          });
        });

        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: EmailEventStatus.processing,
        });

        try {
          await this.retryPolicy.execute(async () => {
            await this.sendGridService.sendEmail({
              toEmail: resetPasswordEmail.getRecipient(),
              subject: resetPasswordEmail.getSubject(),
              body: resetPasswordEmail.getBody(),
            });

            this.loggerService.debug({
              message: 'Sent reset password email.',
              emailEventId: emailEvent.getId(),
              recipient: emailEvent.getRecipientEmail(),
            });
          });
        } catch (error) {
          await this.emailEventRepository.updateStatus({
            id: emailEvent.getId(),
            status: EmailEventStatus.failed,
          });

          retryListener.dispose();

          throw error;
        }

        retryListener.dispose();

        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: EmailEventStatus.processed,
        });

        break;
    }
  }
}
