import tls from 'tls';
import fs from 'fs';
import csv from 'csv-parser';
import { config } from './config.js';
import { logger } from './logger.js';

const certificate = fs.readFileSync(config.certFilePath);

const baseOptions = {
  port: 443,
  ca: certificate,
  rejectUnauthorized: true, // Enforce certificate validation
  timeout: config.timeout,
};

function scan(host) {
  const options = { ...baseOptions, host };

  return new Promise((res) => {
    const client = tls.connect(options, () => {
      const result = {
        domain: host,
        authorized: client.authorized,
        protocol: client.getProtocol(),
        cipher: { ...client.getCipher() },
      };
      client.end();
      res(result);
    });

    // Handle error
    client.on('error', (err) => {
      logger.error({ domain: host, error: err.message }, 'Connection error.');
      res({ domain: host, error: err.message });
    });

    // Handle timeout
    client.setTimeout(baseOptions.timeout, () => {
      client.destroy();
      logger.warn({ domain: host }, 'Connection timed out.');
      res({ domain: host, error: 'Connection timed out.' });
    });
  });
}

// Scan multiple domains in parallel
async function scanDomains(domains) {
  const results = [];
  const limit = config.concurrency; // concurrency limit
  let index = 0;

  while (index < domains.length) {
    const batch = domains.slice(index, limit + index);
    index += limit;

    const batchResult = await Promise.all(batch.map(scan));
    results.push(...batchResult);
  }

  return results;
}

function readDomains(path) {
  return new Promise((res, rej) => {
    const domains = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (row) => {
        if (row.domain) domains.push(row.domain.trim());
      })
      .on('end', () => res(domains))
      .on('error', () => rej(err));
  });
}

function saveResults(results) {
  const path = config.logFilePath;
  fs.writeFileSync(logFilePath, JSON.stringify(results, null, 2));
  logger.info(`Scan results saved to ${path}`);
}

async function run() {
  try {
    logger.info('Reading in domains.');
    const domains = readDomains(config.inputFilePath);

    logger.info({ count: domains.length }, 'Starting scan for domains.');
    const results = await scanDomains(domains);

    logger.info({ count: results.length }, 'Saving results.');
    saveResults(results);

    const authorizedCount = results.filter((r) => r.authorized).length;
    logger.info(
      `Scan completed: ${authorizedCount}/${totalCount} domains are authorized`
    );
  } catch (error) {
    logger.error({ error: err.message }, 'Scanner failed.');
  }
}
