import { Implementation } from "@quick-qui/model-defines";
import path from "path";
import { copyModelDir, createEnvFile, createModelJson, createNpmAndInstall, installPackages, runHooks } from "./buildMethods";
import { getPackageNamesFromLaunch } from "./buildRun";
import { env } from "./Env";

export function flatNpmBuild(
  onlyPush: boolean,
  yesFlag: any,
  launcherImplementation: Implementation,
  implementationModel
) {
  if (!onlyPush) {
    //TODO flatNpm的情况下， npm install不需要两次。
    createNpmAndInstall(yesFlag, "npm");
    const packageNames = getPackageNamesFromLaunch(
      launcherImplementation,
      implementationModel
    );
    if (packageNames.length > 0) {
      installPackages(packageNames);
    }
    createModelJson(launcherImplementation);
    createEnvFile(
      `LAUNCHER_TYPE=${env.launcherType}` +
        (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "") +
        `\nDEV_MODEL_PATH=${path.resolve(env.modelPath)}`
    );
  }
  copyModelDir(".", onlyPush);
  runHooks(launcherImplementation, implementationModel, {
    ...process.env,
    DIST_PATH: path.resolve(env.distDir, "."),
    MODEL_PATH: path.resolve(env.distDir, "."),
  });
}
