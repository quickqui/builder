import { env } from "./Env";
import path from "path";
import { log, childProcessSync, packageBasePath, notNil } from "./Util";
import fs from "fs-extra";
import pkgDir from "pkg-dir";
import { Implementation } from "@quick-qui/model-defines";
import merge from "package-merge-lodash-4";
import assert from "assert";

export function installPackages(packageNames: string[]) {
  const npmPath = path.resolve(".", env.distDir);
  log.info(`run npm install at - ${npmPath}`);
  childProcessSync("npm", ["install", ...packageNames], npmPath);
  log.info(`npm install finished`);
}

export function createNpmAndInstall(yesFlag: boolean, subDir?: string) {
  const npmPath = path.resolve(".", env.distDir);
  log.info(`copying startup script`);
  fs.copySync(
    path.resolve(
      pkgDir.sync(__dirname) ?? ".",
      "./templates",
      subDir ?? "default"
    ),
    npmPath
  );
  log.info(`run npm init at - ${npmPath}`);
  childProcessSync("npm", yesFlag ? ["init", "--yes"] : ["init"], npmPath);
  log.info(`npm init ran - ${npmPath}`);
  log.info(`startup script copied`);
  log.info(`run npm install at - ${npmPath}`);
  childProcessSync("npm", ["install"], npmPath);
  log.info(`npm install finished`);
}
export function copyModelDir(
  targetDirName: string = "modelDir",
  onlyPush = false
) {
  const modelPath = env.modelPath;
  log.info(`copying model dir - ${modelPath}`);
  if (fs.pathExists(path.resolve(modelPath, "model"))) {
    const distModelDir = path.resolve(env.distDir, targetDirName, "model");
    fs.ensureDirSync(distModelDir);
    fs.copySync(path.resolve(modelPath, "model"), distModelDir);
  }
  if (fs.pathExists(path.resolve(modelPath, "dist"))) {
    const distDistDir = path.resolve(env.distDir, targetDirName, "dist");
    fs.ensureDirSync(distDistDir);
    fs.copySync(path.resolve(modelPath, "dist"), distDistDir);
  }
  if (!onlyPush) {
    if (fs.pathExists(path.resolve(modelPath, "package.json"))) {
      const distPackage = path.resolve(
        env.distDir,
        targetDirName,
        "package.json"
      );
      log.info(`merge package`);
      //to merge package.json
      if (fs.pathExists(distPackage)) {
        log.info(`merge package.json`);
        const dst = fs.readFileSync(distPackage);
        const src = fs.readFileSync(path.resolve(modelPath, "package.json"));
        const merged = merge(src, dst);
        fs.writeFileSync(distPackage, merged);
      } else {
        log.info(`copy package.json`);
        fs.copySync(path.resolve(modelPath, "package.json"), distPackage);
      }
    }
  }
  log.info(`model dir copied`);
  if (!onlyPush) {
    const runInstallPath = path.resolve(env.distDir, targetDirName);

    log.info(`run npm install at - ${runInstallPath}`);
    childProcessSync("npm", ["install", "--legacy-peer-deps"], runInstallPath);
    log.info(`npm install finished`);
  }
}

export function createModelJson(launcher: Implementation) {
  if (launcher) {
    const jsonLauncher = JSON.stringify(launcher, undefined, 2);
    const filePathL = path.resolve(
      ".",
      env.distDir,
      "launcherImplementation.json"
    );
    log.info(`writing launcher implementation model json - ${filePathL} ...`);
    fs.writeFileSync(filePathL, jsonLauncher);
    log.info(`launcher implementation model json write done`);
  }
}

export function createEnvFile(obj: string) {
  const filePathEnv = path.resolve(".", env.distDir, ".env");
  log.info(`writing .env file - ${filePathEnv}`);
  fs.writeFileSync(filePathEnv, `${obj}\nDEBUG=*quick*\nDEBUG_LEVEL=INFO`);
  log.info(`.env file write done`);
}
export function runHooks(launcherImplementation, implementationModel,buildingEnv:object) {
  const hookImplementations = getLifeCycleFromLaunch(
    "building",
    launcherImplementation,
    implementationModel
  );
  hookImplementations.forEach((hookImplementation) => {
    log.info("start run building hook for  - " + hookImplementation.name);
    const hook = hookImplementation.lifeCycle?.["building"];
    if (hook) {
      log.info("start run building hook - " + JSON.stringify(hook));
      const { command, args, cwd = "." } = hook;
      assert(hookImplementation.parameters?.packageName!==undefined ,'parameters.packageName can not be undefined');
      const cwdPath = path.resolve(
        packageBasePath(
          env.distDir,
          hookImplementation.parameters?.packageName
        ),
        cwd
      );
      log.debug('cwdPath - '+cwdPath)
      log.debug('buildingEnv - '+ JSON.stringify(buildingEnv));
      log.info(childProcessSync(command, args, cwdPath, buildingEnv));
      log.info("run building hook finished- " + JSON.stringify(hook));
    }
  });
}
function getLifeCycleFromLaunch(
  lifeCycleName: string,
  launcherImplementation,
  implementationModel
): Implementation[] {
  const launch = launcherImplementation.parameters?.["launch"];

  return launch
    ?.map((launchName) => {
      const implementation = implementationModel?.implementations?.find(
        (imp) => imp.name === launchName
      );
      if (
        implementation &&
        implementation.lifeCycle?.[lifeCycleName] !== undefined
      ) {
        return implementation;
      } else {
        return undefined;
      }
    })
    .filter(notNil);
}
