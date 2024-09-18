#/bin/bash
#exit on a single error
set -e

prjAlpha=$(cat ../nextdex_config.json | jq -r '.project_root_alpha')
curr="../$(pwd)"

cd "${prjAlpha}"
git checkout .
git pull
cd "${curr}"
npm run run -- -o Alphatest -rd -ip ${prjAlpha} -sv 1
git commit -am "updated data" && git push
