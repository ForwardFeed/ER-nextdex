#!/bin/env bash
#exit on a single error
set -e
[[ -z $1 ]] && echo "need version" && exit
docker build -t app . --secret id=config.ts,src=devDexServer/config.ts --build-arg CACHEBUST=$(date +%s)
docker tag app us-west2-docker.pkg.dev/stately-planet-436000-q5/er-devdex/er-devdex:"$1"
docker push us-west2-docker.pkg.dev/stately-planet-436000-q5/er-devdex/er-devdex:"$1"