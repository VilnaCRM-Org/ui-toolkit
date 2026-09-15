import path from 'node:path';

const COMPONENT_INPUT = /^src\/components\/([^/]+)\//;
const PACKAGE_INPUT = /^node_modules\/((?:@[^/]+\/)?[^/]+)\//;

function entryOutputs(metafile) {
  return Object.entries(metafile.outputs).filter(
    ([file, output]) => output.entryPoint !== undefined && file.endsWith('.mjs')
  );
}

function reachableOutputs(metafile, start) {
  const seen = new Set();
  const queue = [start];
  while (queue.length > 0) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const imported of metafile.outputs[file].imports) {
      if (imported.kind === 'import-statement' && metafile.outputs[imported.path]) {
        queue.push(imported.path);
      }
    }
  }
  return seen;
}

function componentOf(entryPoint) {
  const [, directory] = /^src\/components\/([^/]+)\/index\.tsx?$/.exec(entryPoint) ?? [];
  return directory ?? null;
}

export function entryFootprints(metafile) {
  const footprints = new Map();
  for (const [file, output] of entryOutputs(metafile)) {
    const name = path.basename(file, '.mjs');
    let bytes = 0;
    const components = new Set();
    const packages = new Set();
    for (const reached of reachableOutputs(metafile, file)) {
      bytes += metafile.outputs[reached].bytes;
      for (const input of Object.keys(metafile.outputs[reached].inputs)) {
        const component = COMPONENT_INPUT.exec(input)?.[1];
        if (component) components.add(component);
        const pkg = PACKAGE_INPUT.exec(input)?.[1];
        if (pkg) packages.add(pkg);
      }
    }
    footprints.set(name, {
      bytes,
      component: componentOf(output.entryPoint),
      components,
      packages,
    });
  }
  return footprints;
}

function sortedList(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function checkEntryBytes(footprints, budget, violations) {
  const rows = [];
  for (const [name, footprint] of footprints) {
    const limit = budget.entryBytes[name] ?? budget.entryBytes.default;
    rows.push({ entry: name, bytes: footprint.bytes, limit });
    if (footprint.bytes > limit) {
      violations.push(
        `${name}: ${footprint.bytes} bytes of JavaScript exceed its ${limit}-byte budget`
      );
    }
  }
  return rows;
}

function checkComposition(footprints, budget, violations) {
  const shared = new Set(budget.sharedEntries);
  for (const [name, footprint] of footprints) {
    if (name === 'index') continue;
    const reached = sortedList(
      [...footprint.components].filter(
        component =>
          component !== footprint.component && footprints.has(component) && !shared.has(component)
      )
    );
    const declared = sortedList(budget.composition[name] ?? []);
    if (reached.join(' ') !== declared.join(' ')) {
      violations.push(
        `${name}: reaches [${reached.join(', ')}] but config/bundle-budget.json composition declares [${declared.join(', ')}]`
      );
    }
  }
}

function checkIsolatedPackages(footprints, budget, violations) {
  for (const [pkg, allowed] of Object.entries(budget.isolatedPackages)) {
    for (const [name, footprint] of footprints) {
      if (name !== 'index' && footprint.packages.has(pkg) && !allowed.includes(name)) {
        violations.push(`${name}: pulls in ${pkg}, which only [${allowed.join(', ')}] may reach`);
      }
    }
  }
}

function checkBudgetNamesEntries(footprints, budget, violations) {
  const named = new Set([
    ...Object.keys(budget.entryBytes).filter(name => name !== 'default'),
    ...budget.sharedEntries,
    ...Object.keys(budget.composition),
    ...Object.values(budget.composition).flat(),
    ...Object.values(budget.isolatedPackages).flat(),
  ]);
  for (const name of sortedList(named)) {
    if (!footprints.has(name)) {
      violations.push(`config/bundle-budget.json names '${name}', which the build does not emit`);
    }
  }
}

function checkStylesheet(metafile, budget, violations) {
  const css = metafile.outputs['build/index.css']?.bytes;
  if (css === undefined) {
    violations.push('the build emitted no build/index.css');
  } else if (css > budget.cssBytes) {
    violations.push(`build/index.css: ${css} bytes exceed its ${budget.cssBytes}-byte budget`);
  }
}

function checkBuildDirectory(buildBytes, budget, violations) {
  if (buildBytes > budget.buildBytes) {
    violations.push(
      `build/: ${buildBytes} bytes exceed the ${budget.buildBytes}-byte package budget`
    );
  }
}

export function evaluateBundleFootprint(metafile, budget, buildBytes) {
  const violations = [];
  const footprints = entryFootprints(metafile);
  if (footprints.size === 0) {
    violations.push('the build emitted no entry points');
  }
  const rows = checkEntryBytes(footprints, budget, violations);
  checkComposition(footprints, budget, violations);
  checkIsolatedPackages(footprints, budget, violations);
  checkBudgetNamesEntries(footprints, budget, violations);
  checkStylesheet(metafile, budget, violations);
  checkBuildDirectory(buildBytes, budget, violations);
  return { rows: rows.sort((a, b) => b.bytes - a.bytes), violations };
}

export function formatFootprintReport({ rows, violations }, buildBytes) {
  const lines = rows.map(
    row => `  ${row.entry.padEnd(28)} ${String(row.bytes).padStart(8)} / ${row.limit}`
  );
  lines.push(`  ${'build/'.padEnd(28)} ${String(buildBytes).padStart(8)} bytes shipped`);
  for (const violation of violations) {
    lines.push(`bundle footprint: ${violation}`);
  }
  return lines.join('\n');
}
