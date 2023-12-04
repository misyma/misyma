# E2E Tests

Tests are implemented and run using [Playwright](https://playwright.dev/docs/intro).

## Local setup

Install dependencies:

```sh
npm install
```

Copy configuration for given environment to run test against:

```sh
cp apps/e2e/.env.dev-eu apps/e2e/.env
```

Run tests:

```sh
# without UI, same as on CI/CD
npm run test:e2e -w @apps/e2e

# with UI (after UI opens you need to trigger the tests)
npm run test:e2e:ui -w @apps/e2e
```

To show report:

```sh
# expects report to be at default location: apps/e2e/playwright-report
npm run test:e2e:report -w @apps/e2e

# use report in different location (e.g. downloaded from GitLab CI/CD artifacts)
npm run test:e2e:report -w @apps/e2e {path_to_report}
```

## Developing tests

To develope new tests you can use [TestGenerator](https://playwright.dev/docs/codegen-intro).
It will record interactions with given web page, as a set of steps including `Locators` for page elements and actions performed on them.

## Testing emails

See [email repository](./src/utils/emailRepository);
