import { env } from "./Env";
import {
  installPackages,
  createNpmAndInstall,
  createModelJson,
  createEnvFile,
  copyModelDir
} from "./buildMethods";
import { getPackageNamesFromLaunch } from "./buildRun";

export function npmBuildRun(onlyPush: boolean, yesFlag: any, launcherImplementation, implementationModel) {
  if (!onlyPush) {
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
      (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "")
    );
  }
  copyModelDir(undefined, onlyPush);
}
