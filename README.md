A website for storing and rating the books you own.

# Deployment

## Frontend

```bash

fly deploy -c apps/frontend/fly.toml

```

### Local deployment for testing

```bash

docker-compose -f docker-compose.build.yml up --build frontend-app

```

## Backend

```bash

fly deploy -c apps/backend/fly.toml

```

### Local deployment for testing

```bash

docker-compose -f docker-compose.build.yml up --build backend-app

```
