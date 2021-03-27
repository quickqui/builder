import { convertToEnv } from "./Util";
import {snakeCase} from 'change-case'
test("env case", () => {
  const obj = { devModelDir: "test" };
  const envString = convertToEnv(obj);
  expect(envString.trim()).toEqual("DEV_MODEL_DIR=test");
});
test("snake case",()=>{
    const t = 'hello-world_file_dir'
    expect(snakeCase(t)).toEqual("hello_world_file_dir");
})