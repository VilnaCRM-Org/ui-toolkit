import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import nthOf from './utils/nth-of';

const REPO_ROOT: string = resolve(__dirname, '..', '..');
const CERTIFICATE_PATH: string = 'specs/implementation-artifacts/final-validation-certificate.md';
const EPICS_PATH: string = 'specs/planning-artifacts/epics.md';
const GUARD_PATH: string = 'tests/unit/final-validation-certificate.test.ts';

const REQUIRED_SECTIONS: string[] = [
  '## 1. Scope and evidence baseline',
  '## 2. Release-readiness summary',
  '### 2.1 Board coverage closure',
  '### 2.2 Provenance and canonical compliance',
  '### 2.3 Export integrity',
  '### 2.4 Quality-gate status',
  '### 2.5 Blocking and non-blocking issues',
  '## 3. Internal consumer compatibility',
  '### 3.1 Consumer scope',
  '### 3.2 Runtime and dependency baseline',
  '### 3.3 Release go/no-go criteria',
  '## 4. Licensing and IP clearance',
  '## 5. Requirement traceability',
  '### 5.1 FR1, FR2, FR3 and FR8 evidence',
  '### 5.2 FR4 to FR7 traceability',
  '## 6. Release Manager validation checklist',
  '## 7. Definition of Done evidence references',
  '## 8. Sign-off',
];

const SIGN_OFF_HEADER: string[] = [
  'Role',
  'reviewer',
  'date',
  'decision',
  'blocking-issues',
  'follow-ups',
];
const SIGN_OFF_ROLES: string[] = [
  'Release Manager',
  'Governance Board — Engineering Lead',
  'Governance Board — QA Lead',
  'Governance Board — Legal/OSS Compliance',
];
const DECISION_TOKENS: string[] = ['`pending`', '`go`', '`no-go`'];
const BLOCKER_STATUS_TOKENS: string[] = ['`open`', '`resolved`'];
const DOD_EVIDENCE: string[] = [
  'specs/implementation-artifacts/story-dod-template.md',
  'specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md',
  'specs/implementation-artifacts/1-4-epic-1-quality-gate-closure.md',
  'specs/implementation-artifacts/2-6-epic-2-quality-gate-closure.md',
  'specs/implementation-artifacts/3-6-epic-3-quality-gate-closure.md',
  'specs/implementation-artifacts/5-1-board-coverage-closure-and-traceability.md',
  'specs/implementation-artifacts/5-3-export-contract-and-entry-point-integrity.md',
];
const DIRECT_EVIDENCE_FRS: string[] = ['FR1', 'FR2', 'FR3', 'FR8'];
const TRACED_FRS: string[] = ['FR4', 'FR5', 'FR6', 'FR7'];
const SEPARATOR_CELL: RegExp = /^:?-{3,}:?$/;
const REPO_PATH: RegExp = /`((?:src|tests|specs|scripts|\.github)\/[^`\n]+)`/g;

interface SignOffRow {
  role: string;
  reviewer: string;
  date: string;
  decision: string;
  blockingIssues: string;
  followUps: string;
}

function readRepoFile(relativePath: string): string {
  return readFileSync(join(REPO_ROOT, relativePath), 'utf8');
}

const certificate: string = existsSync(join(REPO_ROOT, CERTIFICATE_PATH))
  ? readRepoFile(CERTIFICATE_PATH)
  : '';
const epics: string = readRepoFile(EPICS_PATH);

function tableCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split(/(?<!\\)\|/)
    .map(cell => cell.trim());
}

function sectionBody(markdown: string, heading: string): string {
  const start: number = markdown.indexOf(`\n${heading}\n`);
  if (start < 0) return '';
  const level: string = heading.split(' ')[0] ?? '';
  const body: string = markdown.slice(start + heading.length + 2);
  const next: RegExpExecArray | null = new RegExp(`\\n#{1,${level.length}} `).exec(body);
  return next === null ? body : body.slice(0, next.index);
}

function tableRows(section: string): string[][] {
  return section
    .split('\n')
    .filter(line => line.trimStart().startsWith('|'))
    .map(tableCells)
    .filter(cells => !SEPARATOR_CELL.test(nthOf(cells, 0)));
}

function metadata(key: string): string | undefined {
  return new RegExp(`^- \\*\\*${key}:\\*\\* \`([^\`]+)\`$`, 'm').exec(certificate)?.[1];
}

function idsIn(text: string, prefix: string): string[] {
  return [...text.matchAll(new RegExp(`\\b${prefix}-\\d{2}\\b`, 'g'))].map(match => match[0]);
}

const signOffRows: string[][] = tableRows(sectionBody(certificate, '## 8. Sign-off'));
const signOffHeader: string[] = signOffRows[0] ?? [];
const signOffs: SignOffRow[] = signOffRows.slice(1).map(cells => ({
  role: nthOf(cells, 0),
  reviewer: nthOf(cells, 1),
  date: nthOf(cells, 2),
  decision: nthOf(cells, 3),
  blockingIssues: nthOf(cells, 4),
  followUps: nthOf(cells, 5),
}));

const issuesSection: string = sectionBody(certificate, '### 2.5 Blocking and non-blocking issues');
const issueRows: string[][] = tableRows(issuesSection);
const blockerRows: string[][] = issueRows.filter(cells => /^RB-\d{2}$/.test(nthOf(cells, 0)));
const blockerIds: string[] = blockerRows.map(cells => nthOf(cells, 0));
const openBlockerIds: string[] = blockerRows
  .filter(cells => cells[cells.length - 1] === '`open`')
  .map(cells => nthOf(cells, 0));
const followUpIds: string[] = issueRows
  .map(cells => nthOf(cells, 0))
  .filter(id => /^NB-\d{2}$/.test(id));

function firstColumn(heading: string): string[] {
  return tableRows(sectionBody(certificate, heading)).map(cells => nthOf(cells, 0));
}

function citedPaths(): string[] {
  return [...new Set([...certificate.matchAll(REPO_PATH)].map(match => nthOf(match, 1)))]
    .map(path => path.replace(/:[\d,-]+$/, ''))
    .filter(path => !/[<>*…]/.test(path));
}

function story54Section(): string {
  return sectionBody(epics, '### Story 5.4: Internal Release-Readiness Governance Report');
}

describe('final validation certificate', () => {
  describe('the canonical artifact', () => {
    it('exists at the path epics.md Story 5.4 names', () => {
      expect(certificate).not.toBe('');
      expect(epics).toContain(CERTIFICATE_PATH);
    });

    it('names this guard as its enforcement', () => {
      expect(certificate).toContain(GUARD_PATH);
    });

    it.each(REQUIRED_SECTIONS)('carries the section %s', heading => {
      expect(certificate.split('\n')).toContain(heading);
    });

    it('declares a semver certificate-version', () => {
      expect(metadata('certificate-version')).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('declares an ISO certificate-timestamp', () => {
      expect(metadata('certificate-timestamp')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('cites only repository paths that exist', () => {
      const missing: string[] = citedPaths().filter(path => !existsSync(join(REPO_ROOT, path)));
      expect(missing).toEqual([]);
    });
  });

  describe('the epics.md annotation', () => {
    it('points at the canonical certificate from Story 5.4', () => {
      expect(story54Section()).toContain(`\`${CERTIFICATE_PATH}\``);
    });

    it.each(['certificate-version', 'certificate-timestamp'])('repeats the certificate %s', key => {
      expect(story54Section()).toContain(`${key}: \`${metadata(key)}\``);
    });
  });

  describe('blocking and non-blocking issues', () => {
    it('lists at least one blocking and one non-blocking row', () => {
      expect(blockerIds.length).toBeGreaterThan(0);
      expect(followUpIds.length).toBeGreaterThan(0);
    });

    it('keeps blocking ids unique', () => {
      expect(new Set(blockerIds).size).toBe(blockerIds.length);
    });

    it.each(blockerRows)('%s carries a closed status token', (...cells: string[]) => {
      expect(BLOCKER_STATUS_TOKENS).toContain(cells[cells.length - 1]);
    });

    it('puts every open blocker in front of at least one approver', () => {
      const cited: string[] = signOffs.flatMap(row => idsIn(row.blockingIssues, 'RB'));
      expect(openBlockerIds.filter(id => !cited.includes(id))).toEqual([]);
    });
  });

  describe('go/no-go criteria and traceability', () => {
    it('states explicit go/no-go criteria', () => {
      expect(
        firstColumn('### 3.3 Release go/no-go criteria').filter(id => /^G-\d{2}$/.test(id))
      ).not.toEqual([]);
    });

    it.each(DIRECT_EVIDENCE_FRS)('records direct evidence for %s', fr => {
      expect(firstColumn('### 5.1 FR1, FR2, FR3 and FR8 evidence')).toContain(fr);
    });

    it.each(TRACED_FRS)('records Epic 1-4 traceability for %s', fr => {
      expect(firstColumn('### 5.2 FR4 to FR7 traceability')).toContain(fr);
    });

    it.each(DOD_EVIDENCE)('links the Definition of Done evidence %s', path => {
      expect(sectionBody(certificate, '## 7. Definition of Done evidence references')).toContain(
        `\`${path}\``
      );
    });
  });

  describe('sign-off', () => {
    it('carries exactly the sign-off fields Story 5.4 requires', () => {
      expect(signOffHeader).toEqual(SIGN_OFF_HEADER);
    });

    it.each(SIGN_OFF_ROLES)('has a sign-off row for %s', role => {
      expect(signOffs.map(row => row.role)).toContain(role);
    });

    it.each(signOffs)('$role records a closed decision token', (row: SignOffRow) => {
      expect(DECISION_TOKENS).toContain(row.decision);
    });

    it('names the reviewer and date of every decided row', () => {
      const undated: string[] = signOffs
        .filter(row => row.decision !== '`pending`')
        .filter(row => !/^`@[\w-]+`$/.test(row.reviewer) || !/^`\d{4}-\d{2}-\d{2}`$/.test(row.date))
        .map(row => row.role);
      expect(undated).toEqual([]);
    });

    it.each(signOffs)('$role cites only defined blocking issues', (row: SignOffRow) => {
      expect(idsIn(row.blockingIssues, 'RB').filter(id => !blockerIds.includes(id))).toEqual([]);
    });

    it.each(signOffs)('$role cites only defined follow-ups', (row: SignOffRow) => {
      expect(idsIn(row.followUps, 'NB').filter(id => !followUpIds.includes(id))).toEqual([]);
    });

    it('records no go while a blocking issue is open', () => {
      const goes: string[] = signOffs.filter(row => row.decision === '`go`').map(row => row.role);
      expect(openBlockerIds.length > 0 ? goes : []).toEqual([]);
    });
  });
});
