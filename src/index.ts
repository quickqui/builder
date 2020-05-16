#!/usr/bin/env node

import { model } from "./Model";
import {
  withImplementationModel,
  Implementation,
} from "@quick-qui/model-defines";
import { env } from "./Env";
import path from "path";
import fs from "fs-extra";
import { log, childProcessSync } from "./Util";
import pkgDir from "pkg-dir";
import { fail } from "assert";

model.then((m) => {
  const implementationModel = withImplementationModel(m)?.implementationModel;
  if (implementationModel) {
    //TODO 询问生成package的各个字段 -  name、version……
    //MARK npm init有这一步。

    const launcherType = env.launcherType;
    const launcherName = env.launcherName;

    const launcherImplementation = implementationModel?.implementations.find(
      (implementation) =>
        (implementation.abstract ?? false) !== true &&
        implementation.runtime === "launcher" &&
        ((launcherName ? implementation.name === launcherName : false) ||
          launcherType === implementation.parameters?.type)
    );
    log.debug(`launcher - ${JSON.stringify(launcherImplementation)}`);
    if (launcherImplementation) {
      fs.ensureDirSync(path.resolve(".", env.distDir));

      if (launcherType === "docker") {
        createNpmAndInstall();
        createModelJson(implementationModel);
        createEnvFile(
          `LAUNCHER_TYPE=${env.launcherType}` +
            (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "")
        );
        copyModelDir();
      } else if (launcherType === "raw") {
        createNpmAndInstall();
        createModelJson(implementationModel);
        createEnvFile(
          `LAUNCHER_TYPE=${env.launcherType}` +
            (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "")
        );
      } else if (launcherType === "npm") {
        createNpmAndInstall("npm");

        const launch = launcherImplementation.parameters?.["launch"];

        const packageNames = launch
          ?.map((launchName) => {
            const implementation = implementationModel?.implementations?.find(
              (imp) => imp.name === launchName
            );
            if (implementation && implementation.runtime === "command") {
              return implementation.parameters?.["packageName"];
            } else {
              return undefined;
            }
          })
          .filter((_) => _ !== undefined);
        if (packageNames.length > 0) {
          installPackages(packageNames);
        }
        createModelJson(implementationModel);
        createEnvFile(
          `LAUNCHER_TYPE=${env.launcherType}` +
            (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "")
        );
        copyModelDir();
      } else {
        fail(`launcher type not supported yet - ${launcherType}`);
      }
    } else {
      fail(`no launcher found - name=${launcherName}`);
    }

    process.exit();

    //MARK 不同的launcher type有不同的成品目录结构，所以有不同的builder步骤。
    //MARK 有待提高。目前来看builder的模型驱动没有体现，只能是与type的映射。有几个type，有几种builder。
    //MARK type=raw 假定依赖在../xxx 的位置。
    //MARK    index.js launch()
    //MARK type=docker modelDir被mount到每个container
    //MARK    index.js
    //MARK    modelDir
    //MARK type=npm
    //MARK    index.js
    //MARK    modelDir

    //TODO 实现层可能需要一个hook，比如front需要build 到生产环境。
    //TODO front 的 npm run build需要在copy以后运行？

    //MARK template作为optional dependencies 安装。
  }
});
function installPackages(packageNames: string[]) {
  const npmPath = path.resolve(env.distDir);
  log.info(`run npm install at - ${npmPath}`);
  childProcessSync("npm", ["install", ...packageNames], npmPath);
  log.info(`npm install finished`);
}
function createNpmAndInstall(subDir?: string) {
  log.info(`copying startup script`);
  fs.copySync(
    path.resolve(
      pkgDir.sync(__dirname) ?? ".",
      "./templates",
      subDir ?? "default"
    ),
    path.resolve(".", env.distDir)
  );


  log.info(`startup script copied`);
  const npmPath = path.resolve(env.distDir);
  log.info(`run npm install at - ${npmPath}`);
  childProcessSync("npm", ["install"], npmPath);
  log.info(`npm install finished`);
}

function copyModelDir() {
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
}

function createModelJson(implementationModel) {
  const json = JSON.stringify(implementationModel, undefined, 2);
  const filePath = path.resolve(".", env.distDir, "implementationModel.json");
  log.info(`writing implementation model json - ${filePath} ...`);
  fs.writeFileSync(filePath, json);
  log.info(`implementation model json write done`);
}

function createEnvFile(obj: string) {
  const filePathEnv = path.resolve(".", env.distDir, ".env");
  log.info(`writing .env file - ${filePathEnv}`);
  fs.writeFileSync(filePathEnv, `${obj}\nDEBUG=*quick*\nDEBUG_LEVEL=INFO`);
  log.info(`.env file write done`);
}
