const { engines } = require('./package.json');

const version = engines?.node;
const currentMajor = Number.parseInt(process.versions.node.split('.')[0], 10);
const requiredMajor = Number.parseInt(version?.match(/\d+/)?.[0] ?? '', 10);

if (!version) {
  process.stderr.write('The package.json engines.node field is missing.\n');
  process.exit(1);
}

if (Number.isNaN(requiredMajor)) {
  process.stderr.write(`Unsupported engines.node format: ${version}.\n`);
  process.exit(1);
}

if (currentMajor < requiredMajor) {
  process.stderr.write(
    `Required node version ${version} not satisfied with current version ${process.version}.\n`
  );
  process.exit(1);
}
