import { platform } from "os"
import { fromBinary, Message, toBinary } from '@bufbuild/protobuf';
import { GenMessage } from '@bufbuild/protobuf/codegenv1';
import { execSync } from "child_process";
import { MoveList } from "./gen/MoveList_pb.js";
import { MoveListSchema } from "./gen/MoveList_pb.js";
import { AbilityList } from "./gen/AbilityList_pb.js";
import { AbilityListSchema } from "./gen/AbilityList_pb.js";

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

export function readTextproto<T extends Message>(schema: GenMessage<T>): T {
    const protoName = schema.name

    const command = `${protocLocation()} \
      --encode=er.${protoName} \
      --proto_path=./er-config \
      --experimental_allow_proto3_optional \
      ./er-config/${protoName}.proto \
      < ./er-config/${protoName}.textproto`

    console.log(command)
    const ret = execSync(command)

    return fromBinary(schema, ret)
}

export function readMoves(): MoveList {
    return readTextproto(MoveListSchema)
}

export function readAbilities(): AbilityList {
    return readTextproto(AbilityListSchema)
}
