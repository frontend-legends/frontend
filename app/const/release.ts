// release.ts

const version = "v0.50";
const updated = "06 Jun 2026";

const RELEASE = {
  version,
  updated,
  label: `Latest update ${version} from ${updated}`,
} as const;

export default RELEASE;
