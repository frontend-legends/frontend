// release.ts

const version = "v0.50a";
const updated = "21 Aug 2026";

const RELEASE = {
  version,
  updated,
  label: `Latest update ${version} from ${updated}`,
} as const;

export default RELEASE;
