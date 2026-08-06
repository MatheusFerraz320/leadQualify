"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.9.1",
    "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
    "activeProvider": "postgresql",
    "inlineSchema": "generator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel Client {\n  id        String   @id @default(cuid(2))\n  name      String\n  email     String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  leads     Lead[]\n}\n\nmodel Lead {\n  id        String   @id @default(cuid(2))\n  clientId  String\n  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)\n  name      String\n  email     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([clientId, email])\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"Client\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"leads\",\"kind\":\"object\",\"type\":\"Lead\",\"relationName\":\"ClientToLead\"}],\"dbName\":null},\"Lead\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"clientId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"client\",\"kind\":\"object\",\"type\":\"Client\",\"relationName\":\"ClientToLead\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"orderBy\",\"cursor\",\"client\",\"leads\",\"_count\",\"Client.findUnique\",\"Client.findUniqueOrThrow\",\"Client.findFirst\",\"Client.findFirstOrThrow\",\"Client.findMany\",\"data\",\"Client.createOne\",\"Client.createMany\",\"Client.createManyAndReturn\",\"Client.updateOne\",\"Client.updateMany\",\"Client.updateManyAndReturn\",\"create\",\"update\",\"Client.upsertOne\",\"Client.deleteOne\",\"Client.deleteMany\",\"having\",\"_min\",\"_max\",\"Client.groupBy\",\"Client.aggregate\",\"Lead.findUnique\",\"Lead.findUniqueOrThrow\",\"Lead.findFirst\",\"Lead.findFirstOrThrow\",\"Lead.findMany\",\"Lead.createOne\",\"Lead.createMany\",\"Lead.createManyAndReturn\",\"Lead.updateOne\",\"Lead.updateMany\",\"Lead.updateManyAndReturn\",\"Lead.upsertOne\",\"Lead.deleteOne\",\"Lead.deleteMany\",\"Lead.groupBy\",\"Lead.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"clientId\",\"name\",\"email\",\"createdAt\",\"updatedAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"every\",\"some\",\"none\",\"clientId_email\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"createMany\",\"set\",\"disconnect\",\"delete\",\"connect\",\"updateMany\",\"deleteMany\"]"),
    graph: "ZBIgCQQAAEEAICwAAD4AMC0AAAkAEC4AAD4AMC8BAAAAATEBAD8AITIBAAAAATNAAEAAITRAAEAAIQEAAAABACAKAwAARAAgLAAAQwAwLQAAAwAQLgAAQwAwLwEAPwAhMAEAPwAhMQEAPwAhMgEAPwAhM0AAQAAhNEAAQAAhAQMAAF4AIAsDAABEACAsAABDADAtAAADABAuAABDADAvAQAAAAEwAQA_ACExAQA_ACEyAQA_ACEzQABAACE0QABAACFDAABCACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAMAIAEAAAABACAJBAAAQQAgLAAAPgAwLQAACQAQLgAAPgAwLwEAPwAhMQEAPwAhMgEAPwAhM0AAQAAhNEAAQAAhAQQAAF0AIAMAAAAJACABAAAKADACAAABACADAAAACQAgAQAACgAwAgAAAQAgAwAAAAkAIAEAAAoAMAIAAAEAIAYEAABcACAvAQAAAAExAQAAAAEyAQAAAAEzQAAAAAE0QAAAAAEBCwAADgAgBS8BAAAAATEBAAAAATIBAAAAATNAAAAAATRAAAAAAQELAAAQADABCwAAEAAwBgQAAE8AIC8BAEgAITEBAEgAITIBAEgAITNAAEkAITRAAEkAIQIAAAABACALAAATACAFLwEASAAhMQEASAAhMgEASAAhM0AASQAhNEAASQAhAgAAAAkAIAsAABUAIAIAAAAJACALAAAVACADAAAAAQAgEgAADgAgEwAAEwAgAQAAAAEAIAEAAAAJACADBQAATAAgGAAATgAgGQAATQAgCCwAAD0AMC0AABwAEC4AAD0AMC8BADYAITEBADYAITIBADYAITNAADcAITRAADcAIQMAAAAJACABAAAbADAXAAAcACADAAAACQAgAQAACgAwAgAAAQAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAHAwAASwAgLwEAAAABMAEAAAABMQEAAAABMgEAAAABM0AAAAABNEAAAAABAQsAACQAIAYvAQAAAAEwAQAAAAExAQAAAAEyAQAAAAEzQAAAAAE0QAAAAAEBCwAAJgAwAQsAACYAMAcDAABKACAvAQBIACEwAQBIACExAQBIACEyAQBIACEzQABJACE0QABJACECAAAABQAgCwAAKQAgBi8BAEgAITABAEgAITEBAEgAITIBAEgAITNAAEkAITRAAEkAIQIAAAADACALAAArACACAAAAAwAgCwAAKwAgAwAAAAUAIBIAACQAIBMAACkAIAEAAAAFACABAAAAAwAgAwUAAEUAIBgAAEcAIBkAAEYAIAksAAA1ADAtAAAyABAuAAA1ADAvAQA2ACEwAQA2ACExAQA2ACEyAQA2ACEzQAA3ACE0QAA3ACEDAAAAAwAgAQAAMQAwFwAAMgAgAwAAAAMAIAEAAAQAMAIAAAUAIAksAAA1ADAtAAAyABAuAAA1ADAvAQA2ACEwAQA2ACExAQA2ACEyAQA2ACEzQAA3ACE0QAA3ACEOBQAAOQAgGAAAPAAgGQAAPAAgNQEAAAABNgEAAAAENwEAAAAEOAEAAAABOQEAAAABOgEAAAABOwEAAAABPAEAOwAhPQEAAAABPgEAAAABPwEAAAABCwUAADkAIBgAADoAIBkAADoAIDVAAAAAATZAAAAABDdAAAAABDhAAAAAATlAAAAAATpAAAAAATtAAAAAATxAADgAIQsFAAA5ACAYAAA6ACAZAAA6ACA1QAAAAAE2QAAAAAQ3QAAAAAQ4QAAAAAE5QAAAAAE6QAAAAAE7QAAAAAE8QAA4ACEINQIAAAABNgIAAAAENwIAAAAEOAIAAAABOQIAAAABOgIAAAABOwIAAAABPAIAOQAhCDVAAAAAATZAAAAABDdAAAAABDhAAAAAATlAAAAAATpAAAAAATtAAAAAATxAADoAIQ4FAAA5ACAYAAA8ACAZAAA8ACA1AQAAAAE2AQAAAAQ3AQAAAAQ4AQAAAAE5AQAAAAE6AQAAAAE7AQAAAAE8AQA7ACE9AQAAAAE-AQAAAAE_AQAAAAELNQEAAAABNgEAAAAENwEAAAAEOAEAAAABOQEAAAABOgEAAAABOwEAAAABPAEAPAAhPQEAAAABPgEAAAABPwEAAAABCCwAAD0AMC0AABwAEC4AAD0AMC8BADYAITEBADYAITIBADYAITNAADcAITRAADcAIQkEAABBACAsAAA-ADAtAAAJABAuAAA-ADAvAQA_ACExAQA_ACEyAQA_ACEzQABAACE0QABAACELNQEAAAABNgEAAAAENwEAAAAEOAEAAAABOQEAAAABOgEAAAABOwEAAAABPAEAPAAhPQEAAAABPgEAAAABPwEAAAABCDVAAAAAATZAAAAABDdAAAAABDhAAAAAATlAAAAAATpAAAAAATtAAAAAATxAADoAIQNAAAADACBBAAADACBCAAADACACMAEAAAABMgEAAAABCgMAAEQAICwAAEMAMC0AAAMAEC4AAEMAMC8BAD8AITABAD8AITEBAD8AITIBAD8AITNAAEAAITRAAEAAIQsEAABBACAsAAA-ADAtAAAJABAuAAA-ADAvAQA_ACExAQA_ACEyAQA_ACEzQABAACE0QABAACFEAAAJACBFAAAJACAAAAABSQEAAAABAUlAAAAAAQUSAABgACATAABjACBGAABhACBHAABiACBMAAABACADEgAAYAAgRgAAYQAgTAAAAQAgAAAACxIAAFAAMBMAAFUAMEYAAFEAMEcAAFIAMEgAAFMAIEkAAFQAMEoAAFQAMEsAAFQAMEwAAFQAME0AAFYAME4AAFcAMAUvAQAAAAExAQAAAAEyAQAAAAEzQAAAAAE0QAAAAAECAAAABQAgEgAAWwAgAwAAAAUAIBIAAFsAIBMAAFoAIAELAABfADALAwAARAAgLAAAQwAwLQAAAwAQLgAAQwAwLwEAAAABMAEAPwAhMQEAPwAhMgEAPwAhM0AAQAAhNEAAQAAhQwAAQgAgAgAAAAUAIAsAAFoAIAIAAABYACALAABZACAJLAAAVwAwLQAAWAAQLgAAVwAwLwEAPwAhMAEAPwAhMQEAPwAhMgEAPwAhM0AAQAAhNEAAQAAhCSwAAFcAMC0AAFgAEC4AAFcAMC8BAD8AITABAD8AITEBAD8AITIBAD8AITNAAEAAITRAAEAAIQUvAQBIACExAQBIACEyAQBIACEzQABJACE0QABJACEFLwEASAAhMQEASAAhMgEASAAhM0AASQAhNEAASQAhBS8BAAAAATEBAAAAATIBAAAAATNAAAAAATRAAAAAAQQSAABQADBGAABRADBIAABTACBMAABUADAAAQQAAF0AIAUvAQAAAAExAQAAAAEyAQAAAAEzQAAAAAE0QAAAAAEFLwEAAAABMQEAAAABMgEAAAABM0AAAAABNEAAAAABAgAAAAEAIBIAAGAAIAMAAAAJACASAABgACATAABkACAHAAAACQAgCwAAZAAgLwEASAAhMQEASAAhMgEASAAhM0AASQAhNEAASQAhBS8BAEgAITEBAEgAITIBAEgAITNAAEkAITRAAEkAIQIEBgIFAAMBAwABAQQHAAAAAAMFAAgYAAkZAAoAAAADBQAIGAAJGQAKAQMAAQEDAAEDBQAPGAAQGQARAAAAAwUADxgAEBkAEQYCAQcIAQgLAQkMAQoNAQwPAQ0RBA4SBQ8UARAWBBEXBhQYARUZARYaBBodBxseCxwfAh0gAh4hAh8iAiAjAiElAiInBCMoDCQqAiUsBCYtDScuAigvAikwBCozDis0Eg"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map