# opentrons platform makefile
# https://github.com/Opentrons/opentrons

# make OT_PYTHON available
include ./scripts/python.mk

# using bash instead of /bin/bash in SHELL prevents macOS optimizing away our PATH update
SHELL := bash

# add node_modules/.bin to PATH
# TODO(mc, 2021-02-12): remove in favor of `yarn run` directly
PATH := $(shell yarn bin):$(PATH)

API_DIR := api
APP_SHELL_DIR := app-shell
COMPONENTS_DIR := components
DISCOVERY_CLIENT_DIR := discovery-client
LABWARE_LIBRARY_DIR := labware-library
NOTIFY_SERVER_DIR := notify-server
PROTOCOL_DESIGNER_DIR := protocol-designer
SHARED_DATA_DIR := shared-data
UPDATE_SERVER_DIR := update-server
ROBOT_SERVER_DIR := robot-server

# This may be set as an environment variable (and is by CI tasks that upload
# to test pypi) to add a .dev extension to the python package versions. If
# empty, no .dev extension is appended, so this definition is here only as
# documentation
BUILD_NUMBER ?=

# watch, coverage, and update snapshot variables for tests
watch ?= false
cover ?= true
updateSnapshot ?= false

FORMAT_FILE_GLOB = ".*.@(js|ts|tsx|yml)" "**/*.@(ts|tsx|js|json|md|yml)"

ifeq ($(watch), true)
	cover := false
endif

# run at usage (=), not on makefile parse (:=)
# todo(mm, 2021-03-17): Deduplicate with scripts/python.mk.
usb_host=$(shell yarn run -s discovery find -i 169.254)


# install all project dependencies
.PHONY: setup
setup: setup-js setup-py

.PHONY: clean-js
clean-js: clean-ts
	$(MAKE) -C $(DISCOVERY_CLIENT_DIR) clean
	$(MAKE) -C $(COMPONENTS_DIR) clean

PYTHON_DIRS = $(API_DIR) $(UPDATE_SERVER_DIR) $(NOTIFY_SERVER_DIR) $(ROBOT_SERVER_DIR) $(SHARED_DATA_DIR)/python
PYTHON_CLEAN = $(addsuffix -py-clean, $(PYTHON_DIRS))

%-py-clean:
	$(MAKE) -C $* clean

.PHONY: clean-py
clean-py: $(PYTHON_CLEAN)

PYTHON_SETUP = $(addsuffix -py-setup, $(PYTHON_DIRS))
%-py-setup:
	$(MAKE) -C $* setup

.PHONY: prepare-setup-py
prepare-setup-py:
	$(OT_PYTHON) -m pip install pipenv==2020.8.13

.PHONY: setup-py
setup-py: prepare-setup-py 
	$(MAKE) $(PYTHON_SETUP)

PYTHON_TEARDOWN = $(addsuffix -py-teardown, $(PYTHON_DIRS))
%-py-teardown: 
	$(MAKE) -C $* clean teardown

# front-end dependecies handled by yarn
.PHONY: setup-js
setup-js:
	yarn config set network-timeout 60000
	yarn
	$(MAKE) -C $(APP_SHELL_DIR) setup
	$(MAKE) -C $(SHARED_DATA_DIR) setup-js

# uninstall all project dependencies
.PHONY: teardown
teardown: teardown-py teardown-js

.PHONY: teardown-py
teardown-py: $(PYTHON_TEARDOWN)

.PHONY: teardown-js
teardown-js: clean-js
	yarn shx rm -rf "**/node_modules"

.PHONY: deploy-py
deploy-py: export twine_repository_url = $(twine_repository_url)
deploy-py: export pypi_username = $(pypi_username)
deploy-py: export pypi_password = $(pypi_password)
deploy-py:
	$(MAKE) -C $(API_DIR) deploy
	$(MAKE) -C $(SHARED_DATA_DIR) deploy-py

.PHONY: push-api-balena
push-api-balena: export host = $(usb_host)
push-api-balena:
	$(if $(host),@echo "Pushing to $(host)",$(error host variable required))
	$(MAKE) -C $(API_DIR) push-balena
	$(MAKE) -C $(API_DIR) restart

.PHONY: push-api
push-api: export host = $(usb_host)
push-api:
	$(if $(host),@echo "Pushing to $(host)",$(error host variable required))
	$(MAKE) -C $(API_DIR) push

.PHONY: push-api-buildroot
push-api-buildroot: push-api

.PHONY: push-update-server
push-update-server: export host = $(usb_host)
push-update-server:
	$(if $(host),@echo "Pushing to $(host)",$(error host variable required))
	$(MAKE) -C $(UPDATE_SERVER_DIR) push

.PHONY: push
push: export host=$(usb_host)
push:
	$(if $(host),@echo "Pushing to $(host)",$(error host variable required))
	$(MAKE) -C $(API_DIR) push-no-restart
	sleep 1
	$(MAKE) -C $(SHARED_DATA_DIR) push-no-restart
	sleep 1
	$(MAKE) -C $(UPDATE_SERVER_DIR) push
	sleep 1
	$(MAKE) -C $(NOTIFY_SERVER_DIR) push
	sleep 1
	$(MAKE) -C $(ROBOT_SERVER_DIR) push


.PHONY: term
term: export host = $(usb_host)
term:
	$(if $(host),@echo "Connecting to $(host)",$(error host variable required))
	$(MAKE) -C $(API_DIR) term

# all tests
.PHONY: test
test: test-py test-js

# tests that may be run on windows
.PHONY: test-windows
test-windows: test-js test-py-windows

.PHONY: test-e2e
test-e2e:
	$(MAKE) -C $(LABWARE_LIBRARY_DIR) test-e2e
	$(MAKE) -C $(PROTOCOL_DESIGNER_DIR) test-e2e

.PHONY: test-py-windows
test-py-windows:
	$(MAKE) -C $(API_DIR) test
	$(MAKE) -C $(SHARED_DATA_DIR) test-py

.PHONY: test-py
test-py: test-py-windows
	$(MAKE) -C $(UPDATE_SERVER_DIR) test
	$(MAKE) -C $(ROBOT_SERVER_DIR) test
	$(MAKE) -C $(NOTIFY_SERVER_DIR) test

.PHONY: test-js
test-js:
	jest \
		--coverage=$(cover) \
		--watch=$(watch) \
		--updateSnapshot=$(updateSnapshot) \
		--ci=$(if $(CI),true,false)

# lints and typechecks
.PHONY: lint
lint: lint-py lint-js lint-json lint-css check-js circular-dependencies-js

.PHONY: format
format:
ifeq ($(watch),true)
	onchange $(FORMAT_FILE_GLOB) -- prettier --ignore-path .eslintignore --write {{changed}}
else
	prettier --ignore-path .eslintignore --write $(FORMAT_FILE_GLOB)
endif

PYTHON_LINT = $(addsuffix -py-lint, $(PYTHON_DIRS))
%-py-lint:
	$(MAKE) -C $* lint

.PHONY: lint-py
lint-py: $(PYTHON_LINT) 

.PHONY: lint-js
lint-js:
	eslint ".*.@(js|ts|tsx)" "**/*.@(js|ts|tsx)"
	prettier --ignore-path .eslintignore --check $(FORMAT_FILE_GLOB)

.PHONY: lint-json
lint-json:
	eslint --max-warnings 0 --ext .json .

.PHONY: lint-css
lint-css:
	stylelint "**/*.css" "**/*.js"

.PHONY: check-js
check-js: build-ts

.PHONY: build-ts
build-ts:
	yarn tsc --build

.PHONY: clean-ts
clean-ts:
	yarn tsc --build --clean

# TODO: Ian 2019-12-17 gradually add components and shared-data
.PHONY: circular-dependencies-js
circular-dependencies-js:
	madge $(and $(CI),--no-spinner --no-color) --circular protocol-designer/src/index.tsx
	madge $(and $(CI),--no-spinner --no-color) --circular step-generation/src/index.ts
	madge $(and $(CI),--no-spinner --no-color) --circular labware-library/src/index.tsx
	madge $(and $(CI),--no-spinner --no-color) --circular app/src/index.tsx

.PHONY: bump
bump:
	@echo "Bumping versions"
	lerna version $(or $(version),prerelease)
