A website for storing and rating the books you own.

# Development

# Deployment

## Frontend

![Deployment (FE)](https://github.com/misyma/misyma/actions/workflows/deployment-frontend.yml/badge.svg)

```bash

fly deploy -c apps/frontend/fly.toml --build-arg APPLICATION_VERSION=0.2.0

```

### Local deployment for testing

```bash

docker-compose -f docker-compose.prod.yml up --build frontend

```

## Backend

![Deployment (BE)](https://github.com/misyma/misyma/actions/workflows/deployment-backend.yml/badge.svg)

```bash

fly deploy -c apps/backend/fly.toml --build-arg APPLICATION_VERSION=0.2.0

```

### Local deployment for testing

```bash

docker-compose -f docker-compose.prod.yml up --build backend

```
