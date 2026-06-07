# Pula Harvest / Farming Market System

Pula Harvest is a Spring Boot + React/Vite marketplace for buyers, farmers, admins, and delivery agents.

## Stack

- Backend: Spring Boot 3.3, Java 21, Maven, PostgreSQL
- Frontend: React 18, Vite 5, Node 20+
- Auth: JWT bearer tokens

## Repository Layout

- `src/main/java` Spring Boot backend
- `src/test/java` backend tests
- `frontend` React/Vite web frontend
- `mobile` Expo mobile client
- `mobile-app` older duplicate Expo client kept for manual review
- `deploy/aws` AWS deployment templates and checklist

## Backend Local Setup

### Requirements

- Java 21 recommended
- Maven 3.9+
- PostgreSQL 16+

### PostgreSQL

Create a local database and user:

```sql
CREATE DATABASE farming_market;
CREATE USER farming_user WITH PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE farming_market TO farming_user;
```

### Environment

The backend loads `./.env` automatically through `spring.config.import`.

Start from [`.env.example`](./.env.example) and create `.env` with values like:

```properties
DB_URL=jdbc:postgresql://localhost:5432/farming_market
DB_USERNAME=farming_user
DB_PASSWORD=change_me
JWT_SECRET=change-me-to-a-long-random-secret-with-at-least-32-characters
SERVER_PORT=8080
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false
APP_CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:5173,http://127.0.0.1:5173
```

Optional provider variables:

- `ORANGE_MONEY_ENABLED`
- `ORANGE_MONEY_BASE_URL`
- `ORANGE_MONEY_MERCHANT_ID`
- `ORANGE_MONEY_API_KEY`
- `ORANGE_MONEY_CALLBACK_URL`
- `MYZAKA_ENABLED`
- `MYZAKA_BASE_URL`
- `MYZAKA_MERCHANT_ID`
- `MYZAKA_API_KEY`
- `MYZAKA_CALLBACK_URL`

### Run Commands

```bash
mvn clean test
mvn clean package
mvn spring-boot:run
```

### Notes

- Local schema management currently uses JPA `ddl-auto`. No Flyway/Liquibase migrations are configured yet.
- Seed users/categories/products are created by `DataSeederConfig` on startup for local testing.
- Test profile uses H2 and does not require PostgreSQL.

## Frontend Local Setup

### Requirements

- Node 20+ recommended
- npm 10+

### Environment

Start from [`frontend/.env.example`](./frontend/.env.example).

Default local development config in [`frontend/.env.development`](./frontend/.env.development):

```properties
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_WITH_CREDENTIALS=false
```

For LAN/mobile browser testing, override `VITE_API_BASE_URL` with a backend host reachable from that device, for example:

```properties
VITE_API_BASE_URL=http://192.168.1.50:8080/api
```

### Run Commands

```bash
cd frontend
npm install
npm run dev
```

### Production Build

`frontend/.env.production` is a deployment placeholder:

```properties
VITE_API_BASE_URL=https://YOUR_AWS_DOMAIN/api
VITE_API_WITH_CREDENTIALS=false
```

Build with:

```bash
cd frontend
npm install
npm run build
```

## Verification Checklist

Backend:

```bash
mvn clean test
mvn clean package
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

## AWS Deployment

See:

- [deploy/aws/backend.service](./deploy/aws/backend.service)
- [deploy/aws/nginx-pula-harvest.conf](./deploy/aws/nginx-pula-harvest.conf)
- [deploy/aws/backend.env.example](./deploy/aws/backend.env.example)
- [deploy/aws/frontend.env.production.example](./deploy/aws/frontend.env.production.example)
- [deploy/aws/DEPLOYMENT_CHECKLIST.md](./deploy/aws/DEPLOYMENT_CHECKLIST.md)
