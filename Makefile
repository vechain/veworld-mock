SHELL := /bin/bash

# Thor solo
solo-up: #@ Start Thor solo
	docker compose -f docker-compose.yaml up -d --wait thor-solo
solo-down: #@ Stop Thor solo
	docker compose -f docker-compose.yaml down
