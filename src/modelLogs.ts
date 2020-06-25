import { logs } from "./Model";
import { log } from "./Util";

export async function modelLogs(): Promise<void> {
  logs.then(async (ls) => {
    ls.forEach((l) => {
      if (l.level === "error") log.error(l.message);
      else {
        log.info(l.message);
      }
    });
  });
}
