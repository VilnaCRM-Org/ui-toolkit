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

function findAvailablePortFrom(port, portChecker, initialPort) {
  return Promise.resolve(portChecker(port)).then(isAvailable => {
    if (isAvailable) {
      return port;
    }

    if (port >= MAX_PORT) {
      throw new RangeError(`Could not find a free port starting from ${initialPort}`);
    }

    return findAvailablePortFrom(port + 1, portChecker, initialPort);
  });
}

async function findAvailablePort(
  startPort = DEFAULT_STORYBOOK_PORT,
  portChecker = isPortAvailable
) {
  const normalizedStartPort = normalizeStartPort(startPort);

  return findAvailablePortFrom(normalizedStartPort, portChecker, startPort);
}

function writeError(message) {
  process.stderr.write(`${message}\n`);
}

async function main() {
  const requestedPort = normalizeStartPort(process.env.STORYBOOK_PORT);
  const resolvedPort = await findAvailablePort(requestedPort);

  if (resolvedPort !== requestedPort) {
    writeError(`Port ${requestedPort} is already in use; using ${resolvedPort} instead.`);
  }

  process.stdout.write(`${resolvedPort}`);
}

if (require.main === module) {
  main().catch(error => {
    writeError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_STORYBOOK_PORT,
  findAvailablePort,
  isPortAvailable,
  normalizeStartPort,
};
