import { filterObject, noEnvFound } from "./Util";
import { throws } from "assert";
export const env: {
  // modelUrl: string;
  modelPath: string;
  modelServerPort: number;
  distDir: string;
  // launcherName?: string;
} = (() => {
  const defaults = {
    modelServerPort: 1111
  };
  return Object.assign(
    {},
    defaults,
    filterObject({
      // modelUrl: process.env.MODEL_URL ?? no("MODEL_URL"),
      modelPath: process.env.MODEL_PATH ?? noEnvFound("MODEL_PATH"),
      distDir: process.env.DIST_DIR ?? noEnvFound("DIST_DIR"),
      // launcherName: process.env.LAUNCHER_NAME,
      modelServerPort:
       ( (process.env.MODEL_SERVER_PORT &&
          parseInt(process.env.MODEL_SERVER_PORT)) ||
        (process.env.PORT && parseInt(process.env.PORT))) 
    })
  );
})();
