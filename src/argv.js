import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { config } from './config.js';

// Parse command-line arguments
export const argv = yargs(hideBin(process.argv))
  .option('inputFilePath', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    describe: 'Path to the input CSV file with the domains.',
  })
  .option('certFilePath', {
    alias: 'c',
    type: 'string',
    default: config.certFilePath,
    describe:
      'Path to the root certificate PEM file. Defaults to the included mozilla.pem.',
  })
  .option('logFilePath', {
    alias: 'l',
    type: 'string',
    default: config.logFilePath,
    describe: 'Path to save the scan results log file.',
  })
  .option('analysisFilePath', {
    alias: 'a',
    type: 'string',
    default: config.analysisFilePath,
    describe: 'Path to save the analysis of the result log file.',
  })
  .option('concurrency', {
    alias: 'n',
    type: 'number',
    default: config.concurrency,
    describe: 'Number of parallel scans.',
  })
  .option('timeout', {
    alias: 't',
    type: 'number',
    default: config.timeout,
    describe: 'Timeout for each connection (in ms).',
  })
  .help()
  .alias('help', 'h').argv;
