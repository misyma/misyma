# EmailRepository

For testing emails we prepared an in-house solution, based on AWS SimpleEmailService.\
It allows us to fetch recent emails sent to `{testUser}@mail.test.misyma.com`, and then run assertions on email content.

## How to use it in E2E tests:

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Generate email address unique per test run - this way we can later search by a recipient and don't worry about other test scenarios.
  const emailAddress = `${Generator.firstName()}.${Generator.lastName()}@mail.test.misyma.com`;

  // ... some test scenario steps

  const recentEmails = await new EmailRepository().findRecentEmailsByFilters({
    to: emailAddress,
    subject: 'Your order has been placed', // subject valid for given scenario
  });

  // assertions on found emails
  expect(recentEmails).toHaveLength(1);
  expect(recentEmails[0]?.html).toMatch(/Thank you for your order and we appreciate your business/);
});
```

`EmailRepository.findRecentEmailsByFilters` delays first call to S3 (8 seconds by default but can be overridden).\
There is no point in checking S3 immediately. If initial call returns no result, then the repository retries (3 times, waiting 3seconds between retries - this can also by overridden).\
There should be no need to prepend `EmailRepository.findRecentEmailsByFilters` with additional delay using e.g. `await setTimeout(...)`.\

### Debugging

`EmailRepository` dumps recent emails fetched from S3 and parsed, into a folder `apps/e2e/test-emails/{datetime}`. When running tests on GitLab, the folder is part of `test-e2e-data` artifact.
You check recent emails to debug your assertions.

## Architecture

In `us-east-1` we setup AWS SES with [email receiver feature](https://docs.aws.amazon.com/ses/latest/dg/receiving-email.html).

DNS MX record for `mail.test.misyma.com` points to AWS SES in `us-east-1`.\
"Email receiving service" is configured to deliver all incoming emails to S3 bucket `misyma-test-emails` placed in `eu-central-1`.\
When storing the emails in the bucket, SES is using auto generated object keys, without a prefix.\
That makes it impossible to find recent emails by filtering by prefix.\
To avoid situation when bucket contains thousands of emails which would impact time to find recent ones, the bucket has a lifecycle rule defined, to delete objects after 1 day since creation.\

To avoid malicious emails which could generate costs, we setup IP filtering on "Email receiving service".\
We allow only emails sent from Brevo (former SendInBlue) [servers](https://help.brevo.com/hc/en-us/articles/208848409--Brevo-IP-ranges-improve-the-deliverability-of-B2B-emails).

## AWS setup details

Currently AWS services have been setup by hand. In future we will use IaC like terraform for that. Below is a summary of steps for setting up email receiving.

AWS SES is not available in all regions. We decided to setup it in `us-east-1` (as we already use this region, so it will be easier for future setup with IaC).\
Follow https://docs.aws.amazon.com/ses/latest/dg/receiving-email-setting-up.html

### AWS SES - stage 1

- create `Identity` for domain `mail.test.misyma.com`
- update DNS records for the domain using generated CNAMEs visible in `Identity` details (Easy DKIM)
- after verification process succeeds, add `MX` record for the domain

### S3

- create a bucket `misyma-test-emails` in `eu-central-1` (without objects versioning)
- set lifecycle rule to `Expire` after 1 day
- set bucket policy to allow AWS SES to put emails:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSESPuts",
      "Effect": "Allow",
      "Principal": {
        "Service": "ses.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::misyma-test-emails/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceAccount": "xxx",
          "AWS:SourceArn": "arn:aws:ses:us-east-1:xxx:receipt-rule-set/default-rule-set:receipt-rule/s3-forward"
        }
      }
    }
  ]
}
```

### AWS SES - stage 2

See: https://docs.aws.amazon.com/ses/latest/dg/receiving-email-receipt-rules-console-walkthrough.html

- create "rule set" for "Email receiving", named: `default-rule-set`
- create a rule in the rule set, named `s3-forward` with an action to deliver to S3 bucket `arn:aws:s3:::misyma-test-emails` (without encryption, without prefix, without SNS notification)
- activate the `default-rule-set`

### Verify

Now you can send a test email to `anything@mail.test.misyma.com` and check S3 bucket if it was delivered (it should take less than a minute).

### AWS SES - stage 3

Setup IP filtering in "Email receiving" service, to allow only Brevo (former SendInBlue) servers.

See: https://docs.aws.amazon.com/ses/latest/dg/receiving-email-ip-filtering-console-walkthrough.html

Set 4 rules:

- name `allow_brevo_servers_1`, range: `1.179.112.0`, type: `ALLOW`
- name `allow_brevo_servers_2`, range: `77.32.148.0/24`, type: `ALLOW`
- name `allow_brevo_servers_3`, range: `185.41.28.0/24`, type: `ALLOW`
- name `deny_other`, range: `0.0.0.0/0`, type: `BLOCK`
