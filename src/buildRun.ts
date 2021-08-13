#!/usr/bin/env node

import { model } from "./Model";
import {
  Implementation,
  ImplementationModel,
  withImplementationModel,
} from "@quick-qui/implementation-model";
import { env, ensureLauncherName, ensureDistDir } from "./Env";
import path from "path";
import fs from "fs-extra";
import { log } from "./Util";
import { fail } from "assert";
import { flatNpmBuild } from "./directors/npm/run";
import { rawBuildRun } from "./directors/raw/run";
import { electronFlatNpmBuild } from "./directors/electron/run";

export interface RunFlag{
  onlyPush: boolean,
  yesFlag: boolean,
}
export type RunFunction = (
  runFlag: RunFlag,
  launcherImplementation: Implementation,
  implementationModel: ImplementationModel
) => void;

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

        let runFunction: RunFunction | undefined = undefined;
        if (launcherType === "docker") {
          fail(`launcher type not supported yet - ${launcherType}`);
        } else if (launcherType === "raw") {
          runFunction = rawBuildRun;
        } else if (launcherType === "npm") {
          runFunction = flatNpmBuild;
        } else if (launcherType === "electron") {
          runFunction = electronFlatNpmBuild;
        } else {
          fail(`launcher type not supported yet - ${launcherType}`);
        }
        if (runFunction) {
          runFunction(
            {onlyPush,
            yesFlag},
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
    }
  });
}
