// release.ts

const version = "v0.41a";
const updated = "04 Jun 2026";

const RELEASE = {
  version,
  updated,
  label: `Latest update ${version} from ${updated}`,
} as const;

export default RELEASE;
