import semver from 'semver';

export interface PeerViolation {
  name: string;
  reason: string;
}

export type InstalledVersionLookup = (name: string) => string | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringEntries(value: unknown): [string, string][] {
  if (!isRecord(value)) return [];
  return Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  );
}

function devMirrorViolation(
  name: string,
  peerRange: string,
  devRange: string | undefined
): PeerViolation | null {
  if (devRange === undefined) {
    return { name, reason: 'has no devDependency mirror, so the test suite runs against nothing' };
  }
  const floor = semver.minVersion(devRange);
  if (floor === null) {
    return { name, reason: `devDependency range "${devRange}" is not valid semver` };
  }
  if (!semver.satisfies(floor, peerRange)) {
    return {
      name,
      reason:
        `devDependency range "${devRange}" starts at ${floor.version}, ` +
        `outside the peer range "${peerRange}"`,
    };
  }
  return null;
}

function installedViolation(
  name: string,
  peerRange: string,
  installed: string | null
): PeerViolation | null {
  if (installed === null) {
    return {
      name,
      reason: 'is not installed, so nothing proves the peer range against a real version',
    };
  }
  if (!semver.satisfies(installed, peerRange)) {
    return {
      name,
      reason: `installed ${installed} does not satisfy the peer range "${peerRange}"`,
    };
  }
  return null;
}

function evaluatePeer(
  [name, peerRange]: [string, unknown],
  devRanges: ReadonlyMap<string, string>,
  installed: InstalledVersionLookup
): PeerViolation[] {
  if (typeof peerRange !== 'string') {
    return [{ name, reason: `peer range ${JSON.stringify(peerRange)} is not a string` }];
  }
  if (semver.validRange(peerRange) === null) {
    return [{ name, reason: `peer range "${peerRange}" is not valid semver` }];
  }
  return [
    devMirrorViolation(name, peerRange, devRanges.get(name)),
    installedViolation(name, peerRange, installed(name)),
  ].filter((violation): violation is PeerViolation => violation !== null);
}

function peerEntries(pkg: unknown): [string, unknown][] {
  return isRecord(pkg) && isRecord(pkg.peerDependencies)
    ? Object.entries(pkg.peerDependencies)
    : [];
}

export function findPeerViolations(
  pkg: unknown,
  installed: InstalledVersionLookup
): PeerViolation[] {
  const devRanges = new Map(isRecord(pkg) ? stringEntries(pkg.devDependencies) : []);
  return peerEntries(pkg).flatMap(peer => evaluatePeer(peer, devRanges, installed));
}

export function peerCount(pkg: unknown): number {
  return peerEntries(pkg).length;
}

export function formatReport(violations: readonly PeerViolation[]): string {
  return violations.map(violation => `  ${violation.name}: ${violation.reason}`).join('\n');
}
