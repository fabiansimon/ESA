import fs from 'fs';
import { config } from './config.js';
import { logger } from './logger.js';

function analyzeTLSVersions(results) {
  const conResults = results.filter((result) => result.protocol);
  const versionCount = conResults.reduce((counts, result) => {
    const version = result.protocol || 'N/A';
    counts[version] = (counts[version] || 0) + 1;
    return counts;
  }, {});

  const percentages = Object.entries(versionCount).map(([version, count]) => ({
    version,
    percentage: ((count / conResults.length) * 100).toFixed(2),
  }));

  return percentages;
}

function analyzeCertifacteValidity(results) {
  const validCount = results.filter((result) => result.authorized).length;

  return {
    valid: validCount,
    total: results.length,
    percentage: ((validCount / results.length) * 100).toFixed(2),
  };
}

function analyzeCerticateAuthorities(results) {
  const caCount = results
    .filter((result) => result.authorized && result.issuer)
    .reduce((counts, result) => {
      const { issuer: ca } = result;
      counts[ca] = (counts[ca] || 0) + 1;
      return counts;
    }, {});

  const total = Object.values(caCount).reduce(
    (total, count) => (total += count),
    0
  );

  // get the top 10 CA's
  const top = Object.entries(caCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return top.map(([ca, count]) => ({
    ca,
    percentage: ((count / total) * 100).toFixed(2),
  }));
}

function analyzeCipherSuites(results) {
  const outdatedCount = results.filter((result) => {
    if (!result.cipher) return false;
    const { name } = result.cipher;
    return name.includes('RSA') || name.includes('CBC');
  }).length;

  // TODO more analyzing of cipher suites?
  return { outdated: ((outdatedCount / results.length) * 100).toFixed(2) };
}

function analyze() {
  try {
    // read in data
    const data = fs.readFileSync(config.logFilePath, 'utf-8');
    const results = JSON.parse(data);

    const tlsVersions = analyzeTLSVersions(results);
    logger.info({ tlsVersions }, 'TLS Version Analysis');

    const certValidity = analyzeCertifacteValidity(results);
    logger.info({ ...certValidity }, 'Certificate Validity Analysis');

    const topCAs = analyzeCerticateAuthorities(results);
    logger.info({ topCAs }, 'Top Certifcate Authorities');

    const cipherSuites = analyzeCipherSuites(results);
    logger.info({ cipherSuites }, 'Outdated Cipher Suites Analysis');
  } catch (error) {
    logger.error({ error: error.message }, 'Analysis failed');
  }
}

analyze();
