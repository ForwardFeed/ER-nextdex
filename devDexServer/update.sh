#!/bin/env bash
#exit on a single error
set -e

[[ ! -e nextdex_config.json ]] && echo "please run the script once before updating the data or hardcode the project path" && exit
[[ ! $(command -v jq) ]] && echo "please install the jq command, or hardcode the project path" && exit
prj=$(cat ../nextdex_config.json | jq -r '.project_root')
curr=$(pwd)
prjAlpha=$(cat ../nextdex_config.json | jq -r '.project_root_alpha')
echo "$prjAlpha" "$prjAlpha"