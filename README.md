# Sample application packaged as a container

## Getting started

### Set your environment

First you have to modify the file `setenv.sh` with the preferred information and run it.

```
export DOCKER_ROOT=.   # Where docker folder will work
export DOCKER_FILE=Dockerfile
export REGISTRY_URL="default-route-openshift-image-registry.apps-crc.testing" # your Openshift/k8s registry url
export REGISTRY_NAMESPACE="loki"
export IMAGE_NAME="loki-app"
export BUILD_NUMBER=1 # If your running if outside of a CI chain, put it manually
export ARCHIVE_DIR=.
export GIT_BRANCH=""       # If you are filling this, your tag will have more information
export GIT_COMMIT=""       # If you are filling this, your tag will have more information
```

### Build your docker image

By executing `build.sh`:

```
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
```


### Push your image o your docker registry

```docker push ${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}```
