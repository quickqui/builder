#!/usr/bin/env node

import { model } from "./Model";
import { withImplementationModel } from "@quick-qui/model-defines";
import { env, ensureLauncherName, ensureDistDir } from "./Env";
import path from "path";
import fs from "fs-extra";
import { log, notNil } from "./Util";
import { fail } from "assert";
import { flatNpmBuild } from "./flatNpmBuildRun";
import { npmBuildRun } from "./npmBuildRun";
import { devNpmBuildRun } from "./devNpmBuildRun";
import { rawBuildRun } from "./rawBuildRun";

export async function build(args, options, onlyPush = false): Promise<void> {
  const yesFlag = options.yes ?? false;
  const searchIn = args.search;
  return model.then(async (m) => {
    const implementationModel = withImplementationModel(m)?.implementationModel;
    if (implementationModel) {
      let launcherType = env.launcherType;
      let launcherName = env.launcherName;
      log.info("in building");
      if (launcherType == undefined && launcherName == undefined) {
        await ensureLauncherName(searchIn, yesFlag, implementationModel);
        launcherName = env.launcherName;
        launcherType = env.launcherType;
      }
      log.debug(env.launcherName);
      log.debug(env.launcherType);
      const launcherImplementation =
        implementationModel.implementations.find(
          (implementation) =>
            (implementation.abstract ?? false) !== true &&
            implementation.runtime === "launcher" &&
            (launcherName ? implementation.name === launcherName : false)
        ) ??
        implementationModel.implementations.find(
          (implementation) =>
            (implementation.abstract ?? false) !== true &&
            implementation.runtime === "launcher" &&
            launcherType === implementation.parameters?.type
        );
      log.debug(`launcher - ${JSON.stringify(launcherImplementation)}`);
      if (launcherImplementation) {
        await ensureDistDir(yesFlag, launcherImplementation);
        fs.ensureDirSync(path.resolve(".", env.distDir));
        // fs.emptyDirSync(path.resolve(".", env.distDir));
        if (launcherType === "docker") {
          fail(`launcher type not supported yet - ${launcherType}`);
        } else if (launcherType === "raw") {
          rawBuildRun(onlyPush, yesFlag, launcherImplementation);
        } else if (launcherType === "npm") {
          npmBuildRun(
            onlyPush,
            yesFlag,
            launcherImplementation,
            implementationModel
          );
        } else if (launcherType === "devNpm") {
          devNpmBuildRun(
            onlyPush,
            yesFlag,
            launcherImplementation,
            implementationModel
          );
        } else if (launcherType === "flatNpm") {
          flatNpmBuild(
            onlyPush,
            yesFlag,
            launcherImplementation,
            implementationModel
          );
        } else {
          fail(`launcher type not supported yet - ${launcherType}`);
        }
      } else {
        fail(`no launcher found - name=${launcherName}`);
      }
      return;

      //MARK 不同的launcher type有不同的成品目录结构，所以有不同的builder步骤。
      //MARK 有待提高。目前来看builder的模型驱动没有体现，只能是与type的映射。有几个type，有几种builder。
      //MARK type=raw 假定依赖在../xxx 的位置。
      //MARK    index.js launch()
      //MARK type=docker modelDir被mount到每个container
      //MARK    index.js
      //MARK type=npm
      //MARK    index.js
      //MARK    modelDir

      //TODO 实现层可能需要一个hook，比如front需要build 到生产环境。
      //TODO front 的 npm run build需要在copy以后运行？

      //MARK template作为optional dependencies 安装。
    }
  });
}

export function getPackageNamesFromLaunch(
  launcherImplementation,
  implementationModel
): string[] {
  const launch = launcherImplementation.parameters?.["launch"];

  return launch
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
    .filter(notNil);
}
