import { fail } from "assert";

export function filterObject(obj: any) {
  const ret: any = {};
  Object.keys(obj)
    .filter(key => obj[key] !== undefined)
    .forEach(key => (ret[key] = obj[key]));
  return ret;
}

export function noEnvFound(name: string, help?: string) {
  fail(`env not found - ${name} - ${help ?? ""}`);
}
