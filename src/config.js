// Default scanner values
export const config = {
  // inputFilePath: './data/input-small.csv', --> custom input file required
  certFilePath: './data/mozilla.pem',
  analysisFilePath: './logs/analysis-results.pem',
  logFilePath: './logs/scan-results.json',
  concurrency: 1_000,
  timeout: 5_000, // in ms
};
