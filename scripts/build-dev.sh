#!/bin/bash

set -euo pipefail

DOCKER_REGISTRY=docker.vgasoft.vn

BUILD_NUMBER=${1:-latest}
BUILD_TAG=${2:-dev}
echo "$BUILD_NUMBER does not existed. Exit==== $BUILD_TAG"
docker build --build-arg node_env=production -t $DOCKER_REGISTRY/deannangcaonhanthuc-api-"$BUILD_TAG":"$BUILD_NUMBER" .
docker push $DOCKER_REGISTRY/deannangcaonhanthuc-api-"$BUILD_TAG":"$BUILD_NUMBER"
