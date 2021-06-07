import { env } from "./Env";
import {
  createNpmAndInstall,
  createModelJson,
  createEnvFile,
} from "./buildMethods";
import path from "path";
import { childProcessSync, log } from "./Util";

export function rawBuildRun(
  onlyPush: boolean,
  yesFlag: any,
  launcherImplementation
) {
  if (!onlyPush) {
    createNpmAndInstall(yesFlag);
    createModelJson(launcherImplementation);
    createEnvFile(
      `LAUNCHER_TYPE=${env.launcherType}` +
        (env.launcherName ? `\nLAUNCHER_NAME=${env.launcherName}` : "")
    );
    const runInstallPath = path.resolve(env.distDir);
    log.info(`run npm update at - ${runInstallPath}`);
    // childProcessSync("npm", ["install", "--legacy-peer-deps"], runInstallPath);
    // childProcessSync("npm", ["update", "--legacy-peer-deps"], runInstallPath);
    childProcessSync("npm", ["update"], runInstallPath);
    log.info(`npm update finished`);
  }
}
