import tls from 'tls';
import fs from 'fs';
import csv from 'csv-parser';
import { logger } from './logger.js';
import { argv } from './argv.js';

// Read in certifcate to use
const certificate = fs.readFileSync(argv.certFilePath);

// Configure base options
const baseOptions = {
  port: 443,
  ca: certificate,
  rejectUnauthorized: true, // Enforce certificate validation
  timeout: argv.timeout,
};

// Perform TLS scan for a single domain or IP
function scan({ domain, ip }) {
  const options = { ...baseOptions, host: ip || domain, servername: domain };

  return new Promise((res) => {
    const client = tls.connect(options, () => {
      const result = {
        domain,
        authorized: client.authorized,
        issuer: client.authorized
          ? client.getPeerCertificate().issuer.O // Only get issuer if authorized
          : null,
        protocol: client.getProtocol(),
        cipher: { ...client.getCipher() },
      };
      client.end();
      res(result);
    });

    // Handle error
    client.on('error', (err) => {
      logger.error({ domain, ip, error: err.message }, 'Connection error.');
      res({ domain, ip, error: err.message });
    });

    // Handle timeout
    client.setTimeout(baseOptions.timeout, () => {
      client.destroy();
      logger.warn({ domain, ip }, 'Connection timed out.');
      res({ domain, ip, error: 'Connection timed out.' });
    });
  });
}

// Scan multiple domains in parallel
async function scanDomains(domains) {
  const results = [];
  const limit = argv.concurrency; // concurrency limit
  let index = 0;

  while (index < domains.length) {
    const batch = domains.slice(index, limit + index);
    index += limit;

    const batchResult = await Promise.all(batch.map(scan));
    results.push(...batchResult);
  }

  return results;
}

// Read domains and optional IPs from a CSV file
function readDomains(path) {
  return new Promise((res, rej) => {
    const entries = [];
    fs.createReadStream(path)
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
        const domain = row[0].trim();
        const ip = row[1].trim();
        if (domain)
          entries.push({
            domain,
            ip,
          });
      })
      .on('end', () => res(entries))
      .on('error', () => rej(err));
  });
}

// Save scan results to a JSON file
function saveResults(results) {
  const path = argv.logFilePath;
  fs.writeFileSync(path, JSON.stringify(results, null, 2));
  logger.info(`Scan results saved to ${path}`);
}

// main function that handles entire scanning process
async function run() {
  try {
    logger.info('Reading in domains.');
    const entries = await readDomains(argv.inputFilePath);

    logger.info({ count: entries.length }, 'Starting scan for domains.');
    const results = await scanDomains(entries);

    logger.info({ count: results.length }, 'Saving results.');
    saveResults(results);

    const authorizedCount = results.filter((r) => r.authorized).length;
    logger.info(
      `Scan completed: ${authorizedCount}/${results.length} domains are authorized`
    );
  } catch (error) {
    logger.error({ error: error.message }, 'Scanner failed.');
  }
}

// Lets roll
run();
