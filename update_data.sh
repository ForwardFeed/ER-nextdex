#/bin/bash

#exit on a single error
set -e

[[ ! -e nextdex_config.json ]] && echo "please run the script once before updating the data or hardcode the project path" && exit
[[ ! $(command -v jq) ]] && echo "please install the jq command, or hardcode the project path" && exit
prj=$(cat nextdex_config.json | jq -r '.project_root')
curr=$(pwd)
prjAlpha=$(cat nextdex_config.json | jq -r '.project_root_alpha')
echo ${prjAlpha}
# if i don't compile i 100% forget because je suis un âne
tsc

# fetch the multiples version
cd "${prj}"
git checkout origin/ReduxForms
cd "${curr}"
npm run run -- -o Alpha -rd -sv 0
cd "${prj}"
git checkout origin/master
cd "${curr}"
npm run run -- -o 1.6.1 -rd -sv 0
# special for the alphatesters
npm run run -- -o Alphatest -rd -ip ${prjAlpha} -sv 1

# update the version
version=$(grep "%%VERSION%%" static/js/data_version.js | grep -Eo '"[^"]+"' | grep -Eo '[^"]+')
next_version=$((version + 1))
sed -i "s/const LATEST_DATA_VERSION = \"${version}\"/const LATEST_DATA_VERSION = \"${next_version}\"/" static/js/data_version.js


# to calculate the whole data size parsed
# it's just because i thought it would be funny
# misses tons of more data tho
: '
size list of all read files in bash
    a=("include/global.h"
    "src/data/graphics/pokemon.h"
    "src/data/pokemon_graphics/front_pic_table.h"
    "src/data/text/abilities.h"
    "src/data/text/species_names.h"
    "src/data/pokemon/base_stats.h"
    "src/data/pokemon/evolution.h"
    "src/data/pokemon/egg_moves.h"
    "src/data/pokemon/level_up_learnsets.h"
    "src/data/pokemon/level_up_learnset_pointers.h"
    "src/data/pokemon/tmhm_learnsets.h"
    "src/data/pokemon/tutor_learnsets.h"
    "src/data/pokemon/form_species_tables.h"
    "src/data/pokemon/form_species_table_pointers.h"
    "src/data/graphics/pokemon.h"
    "src/data/pokemon_graphics/front_pic_table.h"
    "src/data/wild_encounters.json"
    "include/constants/battle_config.h"
    "src/data/battle_moves.h"
    "src/data/text/move_descriptions.h"
    "src/data/text/move_names.h",
    "src/data/trainer_parties.h")
    b=()
    for x in ${a[@]}; do b+=($(du -c ${prj}${x} | tail -1 | cut -f 1)); done
    sum=0
    for x in ${b[@]}; do sum=$((sum + x)) ;done
    echo "Total size is ${sum} KB"
*/
'