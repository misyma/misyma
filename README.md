A website for storing and rating the books you own.

# Development

TODO: fill

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
