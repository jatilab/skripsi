.PHONY: check fix build test
.PHONY: infra-up infra-down infra-network db-reset infra-deploy infra-destroy
.PHONY: up down migrate healthcheck pipeline
.PHONY: deploy deploy-pipeline swarm-guard swarm-healthcheck destroy

COMPOSE := docker compose --env-file .env.compose
ENV_SWARM := set -a; source .env.swarm; set +a;

check:
	pnpm format:check
	pnpm lint
	pnpm test

fix:
	pnpm format
	pnpm lint:fix

test:
	pnpm test

build:
	docker build -t skripsi-app .

infra-up:
	$(MAKE) -C infra up

infra-down:
	$(MAKE) -C infra down

infra-network:
	$(MAKE) -C infra network

db-reset:
	$(MAKE) -C infra db-reset

infra-deploy: swarm-guard
	$(MAKE) -C infra deploy

infra-destroy:
	$(MAKE) -C infra destroy

up: infra-up
	$(COMPOSE) up -d --wait app

down:
	$(COMPOSE) down app

migrate: infra-up
	$(COMPOSE) run --rm --no-deps -e DB_HOST=postgres app node scripts/migrate.mjs

healthcheck:
	@curl -fsS http://127.0.0.1:3000/livez >/dev/null
	@curl -fsS http://127.0.0.1:3000/readyz >/dev/null
	@echo "healthcheck OK: /livez and /readyz"

pipeline:
	$(MAKE) check
	$(MAKE) build
	$(MAKE) migrate
	$(MAKE) up
	$(MAKE) healthcheck

deploy: infra-network
	$(ENV_SWARM) docker run --rm --network private -e DB_HOST=postgres -e DB_PASSWORD=$$DB_PASSWORD $$APP_IMAGE node scripts/migrate.mjs
	$(ENV_SWARM) docker stack deploy --detach=false --compose-file=compose.yml skripsi-app

deploy-pipeline: swarm-guard
	$(MAKE) check
	$(MAKE) build
	$(MAKE) infra-deploy
	$(MAKE) deploy
	$(MAKE) swarm-healthcheck

swarm-guard:
	@test -z "$$(docker ps -q -f label=com.docker.compose.project=skripsi)" || { echo "ERROR: local app compose is running -> run 'make down' first"; exit 1; }
	@test -z "$$(docker ps -q -f label=com.docker.compose.project=infra)" || { echo "ERROR: local infra compose is running -> run 'make infra-down' first"; exit 1; }

swarm-healthcheck:
	$(ENV_SWARM) curl -fsS --retry 10 --retry-all-errors --retry-delay 2 --max-time 10 https://$$APP_DOMAIN/livez >/dev/null
	$(ENV_SWARM) curl -fsS --retry 10 --retry-all-errors --retry-delay 2 --max-time 10 https://$$APP_DOMAIN/readyz >/dev/null
	@echo "swarm healthcheck OK: /livez and /readyz"

destroy:
	docker stack rm skripsi-app
