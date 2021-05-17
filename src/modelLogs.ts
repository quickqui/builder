import { logs } from "./Model";
import { log } from "./Util";

export async function modelLogs(): Promise<void> {
  return logs.then(async (ls) => {
    ls.forEach((l) => {
      if (l.level === "error") log.error(l.message,' - ',l.context);
      else if (l.level === "warning") log.warning(l.message,' - ',l.context);
      else {
        log.info(l.message);
      }
    });
    return;
  });
}
