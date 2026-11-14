// release.ts

const version = "v0.60";
const updated = "14 Nov 2026";

const RELEASE = {
  version,
  updated,
  label: `Latest update ${version} from ${updated}`,
} as const;

export default RELEASE;
