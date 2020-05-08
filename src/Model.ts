import { Model } from "@quick-qui/model-core";
import { spawn } from "child_process";

import { env } from "./Env";
import axios from "axios";
import path from "path";
import waitPort from "wait-port";

import pkgDir from "pkg-dir";

const modelUrl = `http://localhost:${env.modelServerPort}`;

import exitHook from "async-exit-hook";
import { log } from "./Util";

const params = {
  host: "localhost",
  port: env.modelServerPort,
};

function tryResolve(name: string): string | undefined {
  try {
    return require.resolve(name);
  } catch (err) {
    if (err.code === "MODULE_NOT_FOUND") {
      return undefined;
    } else {
      throw err;
    }
  }
}

const serverPath = tryResolve("@quick-qui/model-server") ;


const server = serverPath
  ? spawn("npm", ["start"], {
      cwd: pkgDir.sync(serverPath),
      stdio: "inherit",
      env: {
        PATH: process.env.PATH,
        MODEL_PATH: path.resolve(".", env.modelPath),
        PORT: env.modelServerPort + "",
      },
    })
  : undefined;

export const model: Promise<Model> = waitPort(params).then((_) =>
  axios.get(`${modelUrl}/models/default`).then((_) => _.data)
);

exitHook(() => {
  log.info(`killing model server...`);
  server?.kill();
  log.info(`model server killed`);
});
