import { ItemEnum } from "../gen/ItemEnum_pb.js";
import { MoveEnum } from "../gen/MoveEnum_pb.js";
import { SpeciesEnum } from "../gen/SpeciesEnum_pb.js";
import { Species_Gender } from "../gen/SpeciesList_pb.js";
import { TrainerEnum } from "../gen/TrainerEnum_pb.js";
import {
  TrainerClass,
  TrainerMusic,
  TrainerParty_TrainerMon,
  TrainerParty_TrainerMon_Nature,
  TrainerPic,
} from "../gen/TrainerList_pb.js";
import { Type } from "../gen/Types_pb.js";
import { GameData } from "../main";
import { readTrainers } from "../proto_utils.js";
import { autojoinFilePath, getMulFilesData } from "../utils";
import * as BaseTrainers from "./base_trainer";
import * as Rematches from "./rematches";
import * as TrainersTeam from "./teams";

export interface Trainer {
  realName: string;
  name: string;
  NAME: string;
  tclass: string;
  double: boolean;
  party: TrainersTeam.TrainerPokemon[];
  insane: TrainersTeam.TrainerPokemon[];
  hell: TrainersTeam.TrainerPokemon[];
  rematches: RematchTrainer[];
  ptr: string;
  ptrInsane: string;
  gender: boolean; // true w*man
  music: string;
  pic: string;
  rematchM: string;
}

export interface RematchTrainer {
  double: boolean;
  party: TrainersTeam.TrainerPokemon[];
  ptr: string;
  NAME: string;
}

function parse(fileData: string): Map<string, Trainer> {
  const lines = fileData.split("\n");
  const RematchesResult = Rematches.parse(lines, 0);
  const baseTrainerResult = BaseTrainers.parse(
    lines,
    RematchesResult.fileIterator
  );
  const trainerTeamResult = TrainersTeam.parse(
    lines,
    baseTrainerResult.fileIterator
  );
  const trainers: Map<string, Trainer> = new Map();
  baseTrainerResult.trainers.forEach((value, key) => {
    if (RematchesResult.rematched.indexOf(key) != -1) return;
    const rematchList = RematchesResult.rematches.get(key) || [];
    let rematchM: string = "";
    const rematchs = rematchList
      .map((x, i) => {
        const rem = baseTrainerResult.trainers.get(x);
        if (!i) rematchM = x;
        if (!rem) return;
        return {
          double: rem.double,
          party: trainerTeamResult.trainers.get(rem.partyPtr) || [],
          ptr: rem.partyPtr,
          NAME: rem.NAME,
        } as RematchTrainer;
      })
      .filter((x) => x) as RematchTrainer[];

    trainers.set(value.NAME, {
      name: value.NAME,
      realName: value.name,
      NAME: value.NAME,
      tclass: value.tclass,
      double: value.double,
      party: trainerTeamResult.trainers.get(value.partyPtr) || [],
      insane: trainerTeamResult.trainers.get(value.insanePtr) || [],
      hell: [],
      rematches: rematchs,
      ptr: value.partyPtr,
      ptrInsane: value.insanePtr,
      gender: value.gender, // true w*man
      music: value.music,
      pic: value.pic,
      rematchM: rematchM,
    });
  });
  return trainers;
}

function monToLegacyMon(
  mon: TrainerParty_TrainerMon,
  gameData: GameData
): TrainersTeam.TrainerPokemon {
  return {
    specie: SpeciesEnum[mon.species],
    ability: Math.max(
      gameData.speciesMap.get(mon.species)!!.ability.indexOf(mon.ability),
      0
    ),
    ivs: [31, 31, 31, 31, 31, mon.ironPill ? 0 : 31],
    evs: [mon.hpEv, mon.atkEv, mon.defEv, mon.spatkEv, mon.spdefEv, mon.speEv],
    item: ItemEnum[mon.item],
    nature: "NATURE_" + TrainerParty_TrainerMon_Nature[mon.nature],
    moves: mon.move.map((it) => MoveEnum[it]),
    hpType: mon.hiddenPowerType ? "TYPE_" + Type[mon.hiddenPowerType] : "",
  };
}

export function getTrainers(gameData: GameData) {
  const trainers = readTrainers();
  const trainerMap = new Map(trainers.trainer.map((it) => [it.id, it]));

  gameData.trainers = new Map();
  for (const trainer of trainers.trainer) {
    const idString = TrainerEnum[trainer.id];
    gameData.trainers.set(idString, {
      name: idString,
      realName: trainer.name,
      NAME: idString,
      tclass: TrainerClass[trainer.class],
      double: trainer.forcedDouble,
      party: trainer.ace?.mon.map((it) => monToLegacyMon(it, gameData)) || [],
      insane:
        trainer.elite?.mon.map((it) => monToLegacyMon(it, gameData)) || [],
      hell: trainer.hell?.mon.map((it) => monToLegacyMon(it, gameData)) || [],
      rematches: [],
      ptr: "",
      ptrInsane: "",
      gender: trainer.gender === Species_Gender.FEMALE,
      music: TrainerMusic[trainer.music],
      pic: TrainerPic[trainer.pic],
      rematchM: "",
    });
  }
}

export function getLegacyTrainers(
  ROOT_PRJ: string,
  gameData: GameData
): Promise<void> {
  return new Promise((resolve: () => void, reject) => {
    const filepaths = autojoinFilePath(ROOT_PRJ, [
      "src/battle_setup.c",
      "src/data/trainers.h",
      "src/data/trainer_parties.h",
    ]);
    getMulFilesData(filepaths, {
      filterComments: true,
      filterMacros: true,
      macros: new Map(),
    })
      .then((fileData) => {
        gameData.trainers = parse(fileData);
        resolve();
      })
      .catch((reason) => {
        const err = "Failed at getting trainers reason: " + reason;
        reject(err);
      });
  });
}
