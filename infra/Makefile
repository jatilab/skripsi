.PHONY: tf-fmt-check network
.PHONY: up down db-reset
.PHONY: deploy destroy

COMPOSE := docker compose --env-file ../.env.compose
ENV_SWARM := set -a; source ../.env.swarm; set +a;

tf-fmt-check:
	terraform fmt -check -recursive terraform

network:
	for net in public private; do docker network create --driver overlay --attachable $$net 2>/dev/null || true; done

up: network
	$(COMPOSE) up -d --wait

down:
	$(COMPOSE) down

db-reset: network
	$(COMPOSE) down -v
	$(COMPOSE) up -d --wait

deploy: network
	$(ENV_SWARM) docker stack deploy --detach=false --compose-file=compose.yml skripsi-infra

destroy:
	docker stack rm skripsi-infra
