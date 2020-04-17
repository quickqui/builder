import { model } from "./Model";
import { withImplementationModel } from "@quick-qui/model-defines";
import { env } from "./Env";
import path from "path";
import fs from "fs";



//NOTE 从../model-server起一个model-server子进程。
model.then(m => {
  const implementationModel = withImplementationModel(m)?.implementationModel;
  if (implementationModel) {
    const json = JSON.stringify(implementationModel, undefined, 2);
    const filePath = path.resolve(".", env.distDir, "implementationModel.json");
    console.log(`writing implementation model json - ${filePath} ...`);
    fs.writeFileSync(filePath, json);
    console.log(`implementation model json write done`);
    process.exit();
    //TODO model/dist 要不要copy过去？
  }
});
