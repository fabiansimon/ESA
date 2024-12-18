export const config = {
  // inputFilePath: './data/input.csv',
  inputFilePath: './data/input-small.csv',
  certFilePath: './data/mozilla.pem',
  domains: './data/domains.csv',
  logFilePath: './logs/scan-results.json',
  concurrency: 1_000,
  timeout: 5_000, // in ms
};
