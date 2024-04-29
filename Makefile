SHELL := /bin/bash

# Thor solo
solo-up: #@ Start Thor solo
	docker compose -f docker-compose.yaml up -d --wait thor-solo
solo-down: #@ Stop Thor solo
	docker compose -f docker-compose.yaml down

# Apps
test-app-up-background: #@ Start the test app in background
	cd apps/test-app && yarn dev &
test-app-up: #@ Start the test app (in foreground)
	cd apps/test-app && yarn dev
