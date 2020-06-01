import { filterObject, noEnvFound } from "./Util";
import dote from "dotenv";

dote.config();


export const env: {
  // modelUrl: string;
  modelPath: string;
  modelServerPort: number;
  distDir: string;
  launcherType: string;
  launcherName?: string;
  // launcherName?: string;
} = (() => {
  const defaults = {
    modelServerPort: 5111,
    launcherType: "npm",
    modelPath:'.'
  };
  return Object.assign(
    {},
    defaults,
    filterObject({
      // modelUrl: process.env.MODEL_URL ?? no("MODEL_URL"),
      modelPath: process.env.MODEL_PATH ,
      launcherName: process.env.LAUNCHER_NAME,
      launcherType: process.env.LAUNCHER_TYPE,
      distDir:
        (process.env.DIST_DIR || process.env.DIST_PATH) ??
        noEnvFound("DIST_DIR"),
    })
  );
})();
