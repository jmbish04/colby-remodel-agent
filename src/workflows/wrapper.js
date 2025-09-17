// This is a wrapper file for exporting both the Astro application as well as
// the ProjectWorkflow class. This is necessary because Astro does not allow
// us to manually export non-Astro stuff as part of the bundle file.
import astroEntry, { pageMap } from "./_worker.js/index.js";
import { ProjectWorkflow } from "../src/workflows/project_workflow.js";
export default astroEntry;
export { ProjectWorkflow, pageMap };
