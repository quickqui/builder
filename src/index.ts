#!/usr/bin/env node
import prog from "caporal";
import { build } from "./buildRun";
import { log } from "./Util";
import dote from "dotenv";
import { modelLogs } from "./modelLogs";

dote.config();
// console.log = log

prog
  .version("1.0.0")
  .logger(log)
  .command("build", "Build a runtime dir")
  .action(function (args, options, logger) {
    return build().then((_) => process.exit(0));
  });
prog.command("verify", "verify model").action(function (args, options, logger) {
  return modelLogs().then((_) => process.exit(0));
});
//   console.log(prog)
// console.log(prog.parse)
prog.parse(process.argv);
