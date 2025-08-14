import { platform } from "os"
import { create, fromBinary, Message } from '@bufbuild/protobuf';
import { GenMessage } from '@bufbuild/protobuf/codegenv1';
import { execSync } from "child_process";
import { MoveList } from "./gen/MoveList_pb.js";
import { MoveListSchema } from "./gen/MoveList_pb.js";
import { AbilityList } from "./gen/AbilityList_pb.js";
import { AbilityListSchema } from "./gen/AbilityList_pb.js";
import { SpeciesList } from "./gen/SpeciesList_pb.js";
import { SpeciesListSchema } from "./gen/SpeciesList_pb.js";
import { ItemListSchema } from "./gen/ItemList_pb.js";
import { ItemList } from "./gen/ItemList_pb.js";
import { readdirSync } from "fs";

function protocLocation() {
    switch (platform()) {
        case 'linux': return "./protoc-linux"
        case 'win32': return "protoc.exe"
        case 'darwin': return "./protoc-osx"
        default:
            console.error(`No proto compiler available for platform ${platform()}`)
            throw "No proto compiler available for platform"
    }
}

export function readTextproto<T extends Message>(schema: GenMessage<T>, textprotoFile?: string): T {
    const protoName = schema.name
    
    const textprotoName = textprotoFile || `${protoName}.textproto`

    const command = `${protocLocation()} \
      --encode=er.${protoName} \
      --proto_path=./er-config \
      --experimental_allow_proto3_optional \
      ./er-config/${protoName}.proto \
      < ./er-config/${textprotoName}`

    console.log(command)
    const ret = execSync(command)

    return fromBinary(schema, ret)
}

export function readMoves(): MoveList {
    //@ts-expect-error
    return readTextproto(MoveListSchema)
}

export function readAbilities(): AbilityList {
    //@ts-expect-error
    return readTextproto(AbilityListSchema)
}

export function readSpecies(): SpeciesList {
    //@ts-expect-error
    return readTextproto(SpeciesListSchema)
}

export function readItems(): ItemList {
  const items = create(ItemListSchema)
  for (const file of readdirSync(`./er-config/items/`)) {
    if (!file.endsWith(".textproto")) continue
    //@ts-expect-error
    items.item.push(...readTextproto(ItemListSchema, `items/${file}`).item)
  }
  return items
}
