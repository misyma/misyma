import fs from 'fs/promises';
import { simpleParser, type ParsedMail } from 'mailparser';
import path from 'path';
import { setTimeout } from 'timers/promises';

import { S3BucketClient } from './s3BucketClient/s3BucketClient.js';

// AWS SDK uses uppercase input/output field names
/* eslint @typescript-eslint/naming-convention: 0 */

interface Email extends ParsedMail {}

interface EmailRepositoryConfig {
  bucket: string;
  dumpDir: string;
}

interface EmailFilters {
  subject?: string;
  to?: string;
}

interface Options {
  initialDelayMsec: number;
  retry: number;
  retryDelayMsec: number;
}

const defaultConfig = {
  bucket: process.env['EMAIL_REPOSITORY_BUCKET'] || 'misyma-test-emails',
  dumpDir: process.env['EMAIL_REPOSITORY_DUMP_DIR'] || 'test-emails',
};

const defaultOptions = {
  initialDelayMsec: 8000,
  retry: 3,
  retryDelayMsec: 3000,
};

export class EmailRepository {
  private static readonly recentEmailsTimeOffsetMsec = 30 * 1000; // 30sec
  private s3BucketClient: S3BucketClient;

  public constructor(private config: EmailRepositoryConfig = defaultConfig) {
    this.s3BucketClient = new S3BucketClient(this.config.bucket);
  }

  public async findRecentEmailsByFilters(
    filters: EmailFilters,
    options: Options = defaultOptions,
    isInitialCall: boolean = true,
  ): Promise<Array<Email>> {
    const { initialDelayMsec, retry, retryDelayMsec } = options;

    if (isInitialCall) {
      console.log(`Waiting ${initialDelayMsec}ms for emails`);

      await setTimeout(initialDelayMsec);
    }

    console.log('Searching emails...', filters);

    const recentEmails = await this.getRecentEmails();

    const matchedEmails = this.filter(recentEmails, filters);

    if (matchedEmails.length === 0 && retry > 0) {
      await setTimeout(retryDelayMsec);

      return this.findRecentEmailsByFilters(
        filters,
        {
          ...options,
          retry: retry - 1,
        },
        false,
      );
    }

    return matchedEmails;
  }

  private async getRecentEmails(): Promise<Array<Email>> {
    const modifiedAfter = new Date(Date.now() - EmailRepository.recentEmailsTimeOffsetMsec);

    const allObjects = await this.s3BucketClient.listObjects();

    const recentObjects = allObjects.filter(({ LastModified }) => {
      if (!LastModified) {
        return false;
      }

      return LastModified > modifiedAfter;
    });

    const recentObjectsSorted = recentObjects.sort(
      (a, b) => (b.LastModified as Date).getTime() - (a.LastModified as Date).getTime(),
    );

    const recentEmailsPromises = recentObjectsSorted.map(async ({ Key }) => {
      const body = await this.s3BucketClient.getObjectBody(Key as string);

      return await simpleParser(body);
    });

    const recentEmails = await Promise.all(recentEmailsPromises);

    await this.writeToDisk(recentEmails);

    return recentEmails;
  }

  private filter(emails: Array<Email>, filters: EmailFilters): Array<Email> {
    if (filters.subject) {
      emails = emails.filter((email) => {
        return email.subject === filters.subject;
      });
    }

    if (filters.to) {
      const lowerCasedTo = filters.to.toLocaleLowerCase();

      emails = emails.filter((email) => {
        if (Array.isArray(email.to)) {
          return email.to.some((to) => {
            return to.value.some((value) => value.address === lowerCasedTo);
          });
        }

        return email.to?.value.some((value) => value.address === lowerCasedTo);
      });
    }

    return emails;
  }

  private async writeToDisk(emails: Email[]): Promise<void> {
    const destDir = path.join(this.config.dumpDir, new Date().toISOString());

    const fileExists = (filepath: string): Promise<boolean> =>
      fs.stat(filepath).then(
        () => true,
        () => false,
      );

    if (!(await fileExists(destDir))) {
      await fs.mkdir(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, 'emails.json');

    await fs.writeFile(destPath, JSON.stringify(emails));
  }
}
