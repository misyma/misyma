export class MockResponse {
  public constructor(
    public statusCode: number,
    public body: string | object | Buffer | undefined,
    public contentType: string = 'application/json',
  ) {}

  public getStringifiedBody(): string {
    if (this.body === undefined) {
      return '';
    }

    if (typeof this.body === 'string') {
      return this.body;
    }

    if (Buffer.isBuffer(this.body)) {
      return this.body.toString('utf-8');
    }

    return JSON.stringify(this.body);
  }
}
