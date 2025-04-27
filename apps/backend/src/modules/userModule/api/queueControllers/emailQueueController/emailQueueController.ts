/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExponentialBackoff, type IDisposable, handleAll, retry } from 'cockatiel';

import { emailTypes } from '../../../../../common/types/emailType.js';
import { type QueueMessagePayload, type QueueChannel } from '../../../../../common/types/queue/queueChannel.js';
import { type QueueController } from '../../../../../common/types/queue/queueController.js';
import { type QueueHandler } from '../../../../../common/types/queue/queueHandler.js';
import { QueuePath } from '../../../../../common/types/queue/queuePath.js';
import { type EmailService } from '../../../../../libs/emailService/emailService.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';
import { emailEventStatuses } from '../../../domain/entities/emailEvent/types/emailEventStatus.js';
import { type EmailEventRepository } from '../../../domain/repositories/emailEventRepository/emailEventRepository.js';

interface ProcessEmailEventPayload {
  readonly data: EmailEvent;
  readonly eventName: string;
}

export class EmailQueueController implements QueueController {
  public constructor(
    private readonly emailEventRepository: EmailEventRepository,
    private readonly emailService: EmailService,
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
      case emailTypes.verifyEmail:
        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: emailEventStatuses.processing,
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
            await this.emailService.sendEmail({
              toEmail: emailEvent.getRecipientEmail(),
              template: {
                name: 'verifyEmail',
                data: emailEvent.getPayload() as any,
              },
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
            status: emailEventStatuses.failed,
          });

          retryListener.dispose();

          throw error;
        }

        retryListener.dispose();

        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: emailEventStatuses.processed,
        });

        break;

      case emailTypes.resetPassword:
        retryListener = this.retryPolicy.onFailure((reason) => {
          this.loggerService.error({
            message: 'Failed to send reset password email.',
            emailEventId: emailEvent.getId(),
            reason,
          });
        });

        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: emailEventStatuses.processing,
        });

        try {
          await this.retryPolicy.execute(async () => {
            await this.emailService.sendEmail({
              toEmail: emailEvent.getRecipientEmail(),
              template: {
                name: 'resetPassword',

                data: emailEvent.getPayload() as any,
              },
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
            status: emailEventStatuses.failed,
          });

          retryListener.dispose();

          throw error;
        }

        retryListener.dispose();

        await this.emailEventRepository.updateStatus({
          id: emailEvent.getId(),
          status: emailEventStatuses.processed,
        });

        break;
    }
  }
}
