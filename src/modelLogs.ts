import { logs } from "./Model";
import { log } from "./Util";

export async function modelLogs(): Promise<void> {
  logs.then(async (ls) => {
    ls.forEach((l) => log.info(JSON.stringify(l)));
  });
}
