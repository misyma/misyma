// TODO: add possibility to have email without template
export abstract class Email {
  protected recipient: string;

  protected abstract subject: string;

  protected abstract bodyTemplate: string;

  public constructor(recipient: string) {
    this.recipient = recipient;
  }

  public getRecipient(): string {
    return this.recipient;
  }

  public getSubject(): string {
    return this.subject;
  }

  protected renderBody(data: Record<string, string>): string {
    let result = this.bodyTemplate;

    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return result;
  }

  public abstract getBody(): string;
}
