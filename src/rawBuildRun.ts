import { env } from "./Env";
import {
  createNpmAndInstall,
  createModelJson,
  createEnvFile
} from "./buildMethods";

export function rawBuildRun(onlyPush: boolean, yesFlag: any, launcherImplementation) {
  if (!onlyPush) {
    createNpmAndInstall(yesFlag);
    createModelJson(launcherImplementation);
    createEnvFile(
      `LAUNCHER_TYPE=${env.launcherType}` +
      (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "")
    );
  }
}
