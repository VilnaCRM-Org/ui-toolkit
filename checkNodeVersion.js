const satisfies = require('semver/functions/satisfies');
const { engines } = require('./package.json');

const version = engines?.node;

if (!version) {
  process.stderr.write('The package.json engines.node field is missing.\n');
  process.exit(1);
}

if (!satisfies(process.version, version)) {
  process.stderr.write(
    `Required node version ${version} not satisfied with current version ${process.version}.\n`
  );
  process.exit(1);
}
