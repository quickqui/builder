import { filterObject, noEnvFound, log } from "./Util";
import prompts from "prompts";
import filenamify from "filenamify";
import { Implementation, ImplementationModel } from "@quick-qui/model-defines";
import path from "path";
import { snakeCase } from "change-case";
import portfinder from "portfinder";

export const env: {
  modelPath: string;
  modelServerPort: number;
  distDir: string;
  launcherType: string;
  launcherName?: string;
} = (() => {
  const defaults = {
    // //不会从外传入，也不会影响外部，基本上是写死的。
    // modelServerPort: portfinder.getPort,
    // //默认值
    // // launcherType: "npm",
    modelPath: ".",
  };
  return Object.assign(
    {},
    defaults,
    filterObject({
      modelPath: process.env.MODEL_PATH,
      launcherName: process.env.LAUNCHER_NAME,
      launcherType: process.env.LAUNCHER_TYPE,
      distDir: process.env.DIST_DIR || process.env.DIST_PATH,
    })
  );
})();
export async function ensureServerPort() {
  if (env.modelServerPort) return;
  const init = 5111;
  env.modelServerPort = await portfinder.getPortPromise({
    port: init, // minimum port
    stopPort: init + 100, // maximum port
  });
}
export async function ensureDistDir(
  yesFlag: boolean,
  implementation: Implementation
) {
  if (env.distDir) {
    return;
  } else {
    const builderPath = process.cwd();
    const distPath = path.resolve(
      env.modelPath,
      "..",
      filenamify(snakeCase(implementation.name + "_dist_dir"))
    );
    if (yesFlag) {
      env.distDir = path.relative(builderPath, distPath);
      return;
    }
    const answer = await prompts({
      type: "text",
      name: "distDir",
      message: "dist dir - Where to put your built dir?",
      initial: path.relative(builderPath, distPath),
    });
    env.distDir = answer.distDir;
    return;
  }
}
export async function ensureLauncherName(
  searchIn: string | undefined,
  yesFlag: boolean,
  implementationModel: ImplementationModel
) {
  const choices = implementationModel.implementations
    .filter(
      (implementation) =>
        (implementation.abstract ?? false) !== true &&
        implementation.runtime === "launcher" &&
        (searchIn ? implementation.name.indexOf(searchIn) !== -1 : true)
    )
    .map((implementation) => ({
      title: implementation.name,
      value: implementation.name,
    }));
  if (choices.length === 1) {
    if (yesFlag) {
      env.launcherName = choices[0].value;
    } else {
      const answer = await prompts({
        type: "select",
        name: "launcherName",
        message: "launcher name - Which launcher you want to use",
        choices,
        initial: 0,
      });
      env.launcherName = answer.launcherName;
    }
  } else if (choices.length === 0) {
    log.warn("no implementation found - " + searchIn);
    ensureLauncherName(undefined, yesFlag, implementationModel);
    return;
  } else {
    const answer = await prompts({
      type: "select",
      name: "launcherName",
      message: "launcher name - Which launcher you want to use",
      choices,
      initial: 0,
    });
    env.launcherName = answer.launcherName;
  }
  if (env.launcherName) {
    env.launcherType = implementationModel.implementations.find(
      (implementation) => implementation.name === env.launcherName
    )!.parameters?.type;
  }
  return;
}
