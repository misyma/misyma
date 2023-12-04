import { GetObjectCommand, ListObjectsV2Command, S3Client, type _Object } from '@aws-sdk/client-s3';

// AWS SDK uses uppercase input/output field names
/* eslint @typescript-eslint/naming-convention: 0 */

export class S3BucketClient {
  private s3Client: S3Client;

  public constructor(private bucket: string) {
    this.s3Client = new S3Client();
  }

  public async listObjects(continuationToken?: string): Promise<_Object[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
    });

    const response = await this.s3Client.send(command);

    const { IsTruncated, ContinuationToken, Contents } = response;

    if (!IsTruncated) {
      return Contents || [];
    }

    const nextResults = await this.listObjects(ContinuationToken);

    return [...(Contents as _Object[]), ...nextResults];
  }

  public async getObjectBody(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const { Body } = await this.s3Client.send(command);

    return Body ? Body.transformToString() : '';
  }
}
