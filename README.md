# skripsi

A basic Next.js web application (auth via Better Auth + Drizzle) used as the test payload for an automated deployment pipeline: CI/CD with GitHub Actions, containerization with Docker, orchestration with Docker Swarm, infrastructure-as-code with Terraform (OCI) via Terraform Cloud, reverse proxying with Traefik, and exposure through Cloudflare Tunnel.

The production environment is provisioned and deployed entirely from this repository.

## Getting Started (development)

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
pnpm format:check   # prettier check
pnpm lint           # eslint
pnpm test           # vitest
```

Local stack runs via Docker Compose (`make up`, `make down`, `make migrate`, `make healthcheck`).

## Deployment

Three GitHub Actions workflows run on a self-hosted runner provisioned on the OCI server:

| Workflow       | Trigger                                   | What it does                                                                                            |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ci.yml`       | Every push (except `infra/**`, `docs/**`) | Prettier check, ESLint, Vitest; image build verification on `main`                                      |
| `cd-app.yml`   | push to `main` (app-relevant paths)       | Build & push image to GHCR, migrate DB, `docker stack deploy`, k6 verification                          |
| `cd-infra.yml` | `infra/**` changes                        | Terraform Cloud run: provisions the OCI server via cloud-init (Docker + Swarm), deploys the infra stack |

Traffic path: Cloudflare Tunnel → Traefik → app replicas (3, behind Swarm's internal LB `lbswarm`).

Manual equivalents live in the `Makefile` (`make pipeline`, `make deploy-pipeline`, `make k6`).

Key directories:

| Path                 | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `compose.yml`        | App stack (3 replicas, healthcheck, Traefik labels + `lbswarm`) |
| `infra/compose.yml`  | Infra stack (Postgres, pgbouncer, Traefik, cloudflared)         |
| `infra/terraform/`   | OCI infrastructure-as-code + cloud-init bootstrap               |
| `.github/workflows/` | CI, CD App, CD Infra pipelines                                  |
| `k6/`                | Deployment availability verification                            |

## Health endpoints

- `/livez` — liveness (instant 200)
- `/readyz` — readiness (200 when the database is reachable)

Both are integrated into the Docker `HEALTHCHECK`.
