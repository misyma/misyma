import { type EmailType } from '../../../../../../common/types/emailType.js';
import { type EmailTemplate } from '../types/emailTemplate.js';

export interface EmailPayload {
  readonly user: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
}

export abstract class Email<T extends EmailPayload> {
  protected user: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };

  protected abstract template: string;

  protected abstract subject: string;

  protected abstract emailType: EmailType;

  public constructor(payload: T) {
    const { user } = payload;

    this.user = user;
  }

  public getUser(): T['user'] {
    return this.user;
  }

  public getType(): EmailType {
    return this.emailType;
  }

  public getTemplate(): string {
    return this.template;
  }

  public getSubject(): string {
    return this.subject;
  }

  public abstract getRenderedEmailTemplate(...args: unknown[]): EmailTemplate;

  protected renderTemplate(template: string, data: Record<string, string>): string {
    let result = template;

    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return result;
  }
}
