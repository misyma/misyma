import { type QueueMessagePayload, type QueueChannel } from '../../../../../common/types/queue/queueChannel.js';
import { type QueueController } from '../../../../../common/types/queue/queueController.js';
import { type QueueHandler } from '../../../../../common/types/queue/queueHandler.js';
import { QueuePath } from '../../../../../common/types/queue/queuePath.js';
import { type ChangeEmailEventStatusCommandHandler } from '../../../application/commandHandlers/changeEmailEventStatusCommandHandler/changeEmailEventStatusCommandHandler.js';
import { type FindEmailEventsQueryHandler } from '../../../application/queryHandlers/findEmailEventsQueryHandler/findEmailEventsQueryHandler.js';
import { type EmailService } from '../../../application/services/emailService/emailService.js';
import {
  ResetPasswordEmail,
  type ResetPasswordEmailTemplateData,
} from '../../../application/types/emails/resetPasswordEmail.js';
import {
  VerificationEmail,
  type VerificationEmailTemplateData,
} from '../../../application/types/emails/verificationEmail.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';
import { EmailEventStatus } from '../../../domain/entities/emailEvent/types/emailEventStatus.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';

interface ProcessEmailEventPayload {
  data: EmailEvent;
  eventName: string;
}

export class EmailQueueController implements QueueController {
  public constructor(
    private readonly findEmailEventsQueryHandler: FindEmailEventsQueryHandler,
    private readonly changeEmailEventStatusCommandHandler: ChangeEmailEventStatusCommandHandler,
    private readonly emailService: EmailService,
  ) {}

  private eventName = 'email';

  public getQueuePaths(): QueuePath[] {
    return [
      QueuePath.create({
        // TODO: Improve types
        handler: this.processEmailEvent.bind(this) as unknown as QueueHandler,
        queuePath: this.eventName,
      }),
    ];
  }

  public getChannels(): QueueChannel[] {
    return [
      {
        getMessages: async (): Promise<QueueMessagePayload[]> => {
          const { emailEvents } = await this.findEmailEventsQueryHandler.execute();

          return emailEvents.map((emailEvent) => ({
            data: emailEvent,
            eventName: this.eventName,
          }));
        },
      },
    ];
  }

  private async processEmailEvent(payload: ProcessEmailEventPayload): Promise<void> {
    const { data: emailEvent } = payload;

    switch (emailEvent.getEmailEventType()) {
      case EmailEventType.verifyEmail:
        const verificationEmail = new VerificationEmail({
          recipient: emailEvent.getEmail(),
          templateData: emailEvent.getPayload() as unknown as VerificationEmailTemplateData,
        });

        await this.changeEmailEventStatusCommandHandler.execute({
          id: emailEvent.getId(),
          status: EmailEventStatus.processing,
        });

        try {
          // TODO: Exponential backoff. Maybe in the router itself
          await this.emailService.sendEmail(verificationEmail);
        } catch (error) {
          await this.changeEmailEventStatusCommandHandler.execute({
            id: emailEvent.getId(),
            status: EmailEventStatus.failed,
          });

          throw error;
        }

        await this.changeEmailEventStatusCommandHandler.execute({
          id: emailEvent.getId(),
          status: EmailEventStatus.processed,
        });

        break;

      case EmailEventType.resetPassword:
        const resetPasswordEmail = new ResetPasswordEmail({
          recipient: emailEvent.getEmail(),
          templateData: emailEvent.getPayload() as unknown as ResetPasswordEmailTemplateData,
        });

        await this.changeEmailEventStatusCommandHandler.execute({
          id: emailEvent.getId(),
          status: EmailEventStatus.processing,
        });

        try {
          await this.emailService.sendEmail(resetPasswordEmail);
        } catch (error) {
          await this.changeEmailEventStatusCommandHandler.execute({
            id: emailEvent.getId(),
            status: EmailEventStatus.failed,
          });

          throw error;
        }

        await this.changeEmailEventStatusCommandHandler.execute({
          id: emailEvent.getId(),
          status: EmailEventStatus.processed,
        });

        break;
    }
  }
}
