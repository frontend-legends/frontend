// release.ts

const version = "v0.40";
const updated = "04 Jun 2026";

const RELEASE = {
  version,
  updated,
  label: `Latest update ${version} from ${updated}`,
} as const;

export default RELEASE;
