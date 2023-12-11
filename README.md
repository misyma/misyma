A website for storing and rating the books you own.

# Development

## Build

```bash

npm run build

```

## Lint

```bash

npm run lint

```

## Frontend

```bash

npm run frontend:dev

```

## Backend

```bash

npm run backend:dev

```

# Tests

![Tests](https://github.com/misyma/misyma/actions/workflows/test.yml/badge.svg)

Tests are run through a [Github action](https://github.com/misyma/misyma/actions/workflows/test.yml) every day at 3am.

## Unit

```bash

npm run test:unit

```

## Integration

```bash

npm run test:integration

```

## E2E

```bash

npm run test:e2e

```

# Deployment

## Frontend

![Deployment (FE)](https://github.com/misyma/misyma/actions/workflows/deployment-frontend.yml/badge.svg)

Deployment is done through a [Github action](https://github.com/misyma/misyma/actions/workflows/deployment-frontend.yml).

### Local deployment for testing

```bash

docker-compose -f docker-compose.prod.yml up --build frontend

```

## Backend

![Deployment (BE)](https://github.com/misyma/misyma/actions/workflows/deployment-backend.yml/badge.svg)

Deployment is done through a [Github action](https://github.com/misyma/misyma/actions/workflows/deployment-backend.yml).

### Local deployment for testing

```bash

docker-compose -f docker-compose.prod.yml up --build backend

```
