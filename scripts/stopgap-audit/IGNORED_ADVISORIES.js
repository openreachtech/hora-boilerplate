/**
 * Advisories `npm run audit:npm` lets through, as a stopgap until a release fixes them.
 *
 * Each entry carries its reason and the condition for removing it.
 * The reason names the code of the dependency that was read to confirm the path is not reached.
 * An entry whose advisory is no longer reported fails the audit,
 * so this list cannot outlive the reasons it was written for.
 *
 * @type {Array<NpmAuditType.IgnoredAdvisory>}
 * @example
 * const IGNORED_ADVISORIES = [
 *   {
 *     id: 'GHSA-xxxx-xxxx-xxxx',
 *     package: 'example-package',
 *     path: 'example-parent > example-package',
 *     reason: 'No patched release exists, and the vulnerable code path is not reached from this repository.',
 *     removeWhen: 'example-package publishes a release outside the affected range, or the advisory is withdrawn',
 *   },
 * ]
 */
const IGNORED_ADVISORIES = [
]

export default IGNORED_ADVISORIES
