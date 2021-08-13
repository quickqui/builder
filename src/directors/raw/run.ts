import { env } from "../../Env";
import {
  createNpmAndInstall,
  createModelJson,
  createEnvFile,
} from "../../buildMethods";
import path from "path";
import { childProcessSync, log } from "../../Util";
import {
  Implementation,
  ImplementationModel,
} from "@quick-qui/implementation-model";
import { RunFlag } from "../../buildRun";

export function rawBuildRun(
  { onlyPush, yesFlag }: RunFlag,
  launcherImplementation: Implementation,
  implementationModel: ImplementationModel
) {
  if (!onlyPush) {
    createNpmAndInstall(yesFlag, path.resolve(__dirname, "./template"));
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
