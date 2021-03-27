#!/usr/bin/env node


import dote from "dotenv";
dote.config();

import prog from "caporal";
import { build } from "./buildRun";
import { modelLogs } from "./modelLogs";
import { log } from "./Util";

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
prog.command("server","Start a model server").action(function (args, options,logger){
  return modelLogs().then((_) => {
    //do nothing.
  });
})
prog.command('devRun','run a dev enumeration').action(function (args, options,logger){

})
//   console.log(prog)
// console.log(prog.parse)
prog.parse(process.argv);
