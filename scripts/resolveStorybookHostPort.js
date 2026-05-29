const net = require('net');

const DEFAULT_STORYBOOK_PORT = 6006;
const MAX_PORT = 65535;

function normalizeStartPort(value) {
  const parsedPort = Number.parseInt(`${value}`, 10);

  if (Number.isNaN(parsedPort) || parsedPort < 1 || parsedPort > MAX_PORT) {
    return DEFAULT_STORYBOOK_PORT;
  }

  return parsedPort;
}

function isPortAvailable(port) {
  return new Promise(resolve => {
    const server = net.createServer();

    server.unref();
    server.on('error', () => resolve(false));
    server.listen({ host: '0.0.0.0', port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(startPort = DEFAULT_STORYBOOK_PORT, portChecker = isPortAvailable) {
  let port = normalizeStartPort(startPort);

  while (!(await portChecker(port))) {
    port += 1;

    if (port > MAX_PORT) {
      throw new RangeError(`Could not find a free port starting from ${startPort}`);
    }
  }

  return port;
}

async function main() {
  const requestedPort = normalizeStartPort(process.env.STORYBOOK_PORT);
  const resolvedPort = await findAvailablePort(requestedPort);

  if (resolvedPort !== requestedPort) {
    console.error(`Port ${requestedPort} is already in use; using ${resolvedPort} instead.`);
  }

  process.stdout.write(`${resolvedPort}`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_STORYBOOK_PORT,
  findAvailablePort,
  isPortAvailable,
  normalizeStartPort,
};
