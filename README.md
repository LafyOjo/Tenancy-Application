# Tenancy Monorepo

This repository is a Turborepo monorepo containing:

- **apps/web** – Next.js 14 application with App Router, TypeScript, Tailwind CSS, shadcn/ui, i18next and PWA support.
- **apps/api** – NestJS API with Prisma, Zod validation and Swagger docs.
- **packages/ui** – Shared UI components.
- **packages/types** – Shared TypeScript types.
- **packages/config** – Shared configuration utilities.

## Development

Use `npm run dev` to start all apps in development mode. Run `npm run build` to build, `npm run lint` to lint and `npm run typecheck` for type checking across the monorepo.

A `docker-compose.yml` is provided to start Postgres, Redis and Localstack (S3) services for local development.
