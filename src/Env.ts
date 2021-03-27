import { filterObject, noEnvFound } from "./Util";
import prompts from "prompts";
import filenamify from "filenamify";
import { Implementation, ImplementationModel } from "@quick-qui/model-defines";
import path from "path";
import { snakeCase } from 'change-case';

export const env: {
  modelPath: string;
  modelServerPort: number;
  distDir: string;
  launcherType: string;
  launcherName?: string;
} = (() => {
  const defaults = {
    //不会从外传入，也不会影响外部，基本上是写死的。
    modelServerPort: 5111,
    //默认值
    // launcherType: "npm",
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
export async function ensureDistDir(implementation: Implementation) {
  if (env.distDir) {
    return;
  } else {
    const builderPath = process.cwd();
    const distPath = path.resolve(
      env.modelPath,
      "..",
      filenamify(snakeCase(implementation.name + "_dist_dir"))
    );
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
  implementationModel: ImplementationModel
) {
  const answer = await prompts({
    type: "select",
    name: "launcherName",
    message: "launcher name - Which launcher you want to use",
    choices: implementationModel.implementations
      .filter(
        (implementation) =>
          (implementation.abstract ?? false) !== true &&
          implementation.runtime === "launcher"
      )
      .map((implementation) => ({
        title: implementation.name,
        value: implementation.name,
      })),
    initial: 0,
  });
  env.launcherName = answer.launcherName;
  if (answer.launcherName) {
    env.launcherType = implementationModel.implementations.find(
      (implementation) => implementation.name === answer.launcherName
    )!.parameters?.type;
  }
  return;
}
