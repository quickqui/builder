import fs from "fs-extra";
import path = require("path");
import rewire = require("rewire");
let module = rewire("./buildMethods");

test("merge package", () => {
  const packageJson = module.__get__("packageJson");
  const re = packageJson(["a", "b"]);
  expect(re).toEqual(
    expect.objectContaining({
      dependencies: expect.objectContaining({
        a: expect.stringContaining("latest"),
        b: expect.stringContaining("latest"),
      }),
    })
  );
});
test("merge to file", () => {
  const disPath = path.resolve("./distPackage.json.test");
  const mergeToPkgFile = module.__get__("mergeToPkgFile");
  mergeToPkgFile(disPath, undefined, {
    dependencies: { a: "latest", b: "latest" },
  });
  const obj = JSON.parse(fs.readFileSync(disPath).toString());
  expect(obj).toEqual(
    expect.objectContaining({
      dependencies: expect.objectContaining({
        a: expect.stringContaining("latest"),
        b: expect.stringContaining("latest"),
      }),
    })
  );
});
