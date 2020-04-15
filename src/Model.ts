import { Model } from "@quick-qui/model-core";
import { spawn } from "child_process";

import { env } from "./Env";
import axios from "axios";
import path from "path";
import waitPort from "wait-port";
const modelUrl = `http://localhost:${env.modelServerPort}`;

import exitHook from "async-exit-hook";

const params = {
  host: "localhost",
  port: env.modelServerPort
};

const server = spawn("npm", ["start"], {
  cwd: path.resolve(".", "../model-server"),
  stdio: "inherit",
  env: {
    PATH: process.env.PATH,
    MODEL_PATH: env.modelPath,
    PORT: env.modelServerPort + ""
  }
});

export const model: Promise<Model> = waitPort(params).then(_ =>
  axios.get(`${modelUrl}/models/default`).then(_ => _.data)
);


exitHook(() => {
  //TODO 有时候kill不成功，没有明白是为啥。有时候启动会有port 1111被占用的报告。可能跟开发中save文件，此进程重启有关。
  console.log(`killing model server...`);
  server?.kill();
  console.log(`model server killed`);
});