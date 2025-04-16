// list of file to sparsely check out, these are the one the nextdex application will require

export default {
  list: [
    "include/global.h",
    "src/battle_setup.c",
    "src/data/trainers.h",
    "src/data/trainer_parties.h",
    "include/constants/battle_config.h",
    "src/battle_util.c",
    "src/data/wild_encounters.json",
    //'data/maps/', // due to the slowness of the git script, this will not be doable
  ],
};
