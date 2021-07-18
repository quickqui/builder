import { Implementation } from "@quick-qui/implementation-model";
import path from "path";
import { copyModelDir, createEnvFile, createModelJson, createNpmAndInstall, installPackages, runHooks } from "./buildMethods";
import { getPackageNamesFromLaunch } from "./buildRun";
import { env } from "./Env";
import { childProcessSync, log } from "./Util";

export function electronFlatNpmBuild(
  onlyPush: boolean,
  yesFlag: any,
  launcherImplementation: Implementation,
  implementationModel
) {
  if (!onlyPush) {
    //TODO flatNpm的情况下， npm install不需要两次。
    createNpmAndInstall(yesFlag, "electron");
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
  if (!onlyPush) {
    const runInstallPath = path.resolve(env.distDir);
    log.info(`run npm update at - ${runInstallPath}`);
    // childProcessSync("npm", ["install", "--legacy-peer-deps"], runInstallPath);
    // childProcessSync("npm", ["update", "--legacy-peer-deps"], runInstallPath);
    childProcessSync("npm", ["update"], runInstallPath);
    log.info(`npm update finished`);
  }
  runHooks(launcherImplementation, implementationModel, {
    ...process.env,
    DIST_PATH: path.resolve(env.distDir, "."),
    MODEL_PATH: path.resolve(env.distDir, "."),
  });
}
