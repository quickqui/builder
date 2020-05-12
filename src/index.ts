#!/usr/bin/env node

import { model } from "./Model";
import { withImplementationModel } from "@quick-qui/model-defines";
import { env } from "./Env";
import path from "path";
import fs from "fs-extra";
import { log, childProcessSync } from "./Util";
import pkgDir from "pkg-dir";

model.then((m) => {
  const implementationModel = withImplementationModel(m)?.implementationModel;
  if (implementationModel) {
    //TODO 询问生成package的各个字段 -  name、version……
    //MARK npm init有这一步。
    log.info(`copying startup script`);
    fs.ensureDirSync(path.resolve(".", env.distDir));
    fs.copySync(
      path.resolve(pkgDir.sync(__dirname) ?? ".", "./templates"),
      path.resolve(".", env.distDir)
    );
    log.info(`startup script copied`);

    const npmPath = path.resolve(env.distDir);
    log.info(`run npm install at - ${npmPath}`);
    childProcessSync("npm", ["install"], npmPath);
    log.info(`npm install finished`);

    const json = JSON.stringify(implementationModel, undefined, 2);
    const filePath = path.resolve(".", env.distDir, "implementationModel.json");
    log.info(`writing implementation model json - ${filePath} ...`);
    fs.writeFileSync(filePath, json);
    log.info(`implementation model json write done`);

    const filePathEnv = path.resolve(".", env.distDir, ".env");
    log.info(`writing .env file - ${filePathEnv}`);
    fs.writeFileSync(
      filePathEnv,
      `LAUNCHER_TYPE=${env.launcherType}` +
        (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "")
    );
    log.info(`.env file write done`);

    const modelPath = env.modelPath;
    log.info(`copying model dir - ${modelPath}`);
    if (fs.pathExists(path.resolve(modelPath, "model"))) {
      const distModelDir = path.resolve(env.distDir, "modelDir", "model");
      fs.ensureDirSync(distModelDir);
      fs.copySync(path.resolve(modelPath, "model"), distModelDir);
    }
    if (fs.pathExists(path.resolve(modelPath, "dist"))) {
      const distDistDir = path.resolve(env.distDir, "modelDir", "dist");
      fs.ensureDirSync(distDistDir);
      fs.copySync(path.resolve(modelPath, "dist"), distDistDir);
    }
    if (fs.pathExists(path.resolve(modelPath, "package.json"))) {
      const distPackage = path.resolve(env.distDir, "modelDir", "package.json");
      fs.copySync(path.resolve(modelPath, "package.json"), distPackage);
    }
    log.info(`model dir copied`);

    const runInstallPath = path.resolve(env.distDir, "modelDir");
    log.info(`run npm install at - ${runInstallPath}`);
    childProcessSync("npm", ["install"], runInstallPath);
    log.info(`npm install finished`);

    process.exit();

    //TODO 实现层可能需要一个hook，比如front需要build 到生产环境。
    //TODO front 的 npm run build需要在copy以后运行？

    //MARK template作为optional dependencies 安装。
  }
});
