#!/usr/bin/env bash

local TIMESTAMP=$( date -u "+%Y%m%d%H%M%S")
IMAGE_TAG=${TIMESTAMP}
if [ ! -z "${GIT_COMMIT}" ]; then
  local GIT_COMMIT_SHORT=$( echo ${GIT_COMMIT} | head -c 8 )
  IMAGE_TAG=${GIT_COMMIT_SHORT}-${IMAGE_TAG}
fi
if [ ! -z "${GIT_BRANCH}" ]; then IMAGE_TAG=${GIT_BRANCH}-${IMAGE_TAG} ; fi
IMAGE_TAG=${BUILD_NUMBER}-${IMAGE_TAG}
echo "=========================================================="
echo -e "BUILDING CONTAINER IMAGE: ${IMAGE_NAME}:${IMAGE_TAG}"
if [ -z "${DOCKER_ROOT}" ]; then DOCKER_ROOT=. ; fi
if [ -z "${DOCKER_FILE}" ]; then DOCKER_FILE=Dockerfile ; fi
set -x

docker build -f ${DOCKER_ROOT}/${DOCKER_FILE} -t ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} ${EXTRA_BUILD_ARGS} ${DOCKER_ROOT}
set +x
