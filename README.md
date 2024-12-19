# TLS/X.509 Scanner

A Node.js-based TLS/X.509 scanner designed to analyze the security configurations of websites, including TLS versions, certificate validity, and cipher suites. This project supports custom root certificate stores and processes multiple domains in parallel with robust logging and analysis capabilities.

---

## Features

- Scans domains for:
  - Supported TLS versions (1.0, 1.1, 1.2, 1.3).
  - Certificate validity and trust (against Mozilla or custom root stores).
  - Cipher suites offered by servers.
- Highly configurable via CLI:
  - Custom root certificate file (.pem).
  - Input file with a list of domains in CSV format.
  - Parallel scanning for efficiency.
  - Custom logging and timeout settings.
  - Logs results in JSON format for easy analysis.

## Installation

1. Clone the Repository:

```
git clone https://github.com/yourusername/tls-x509-scanner.git

cd tls-x509-scanner
```

2. Install Dependencies:
   `npm install`

3. Structure Your Data:
   - Input files (e.g., `domains.csv`) should be stored in the data directory.
   - Ensure the Mozilla root certificate store (`mozilla.pem`) is available in data or specify a custom `.pem` file.

**The input file must be a CSV with the following format:**

```
example.com,178.154.102.106
google.com,128.154.225.106
yahoo.com,200.154.225.106
```

## Usage

## 1. Running the Scanner

You can run the scanner directly via the `run` script or use the `npm run` commands.

- Using the `run` Script

This script runs the scanner, and optionally runs the analyzer if the scan succeeds.

```
./run -i "./data/input-small.csv" -c "./data/mozilla.pem" -l "./logs/scan-results.json" -t 5000 -n 20
```

- Using npm

Run the scanner directly using npm:

```
npm run scan -- -i "./data/input-small.csv" -c "./data/mozilla.pem" -l "./logs/scan-results.json" -t 5000 -n 20
```

## Options

#### **Options**

| Option            | Alias | Type    | Default                    | Description                                                |
| ----------------- | ----- | ------- | -------------------------- | ---------------------------------------------------------- |
| `--inputFilePath` | `-i`  | String  | (required)                 | Path to the input CSV file containing the domains to scan. |
| `--certFilePath`  | `-c`  | String  | `./data/mozilla.pem`       | Path to the root certificate PEM file.                     |
| `--logFilePath`   | `-l`  | String  | `./logs/scan-results.json` | Path to save the scan results log file.                    |
| `--concurrency`   | `-n`  | Number  | 1000                       | Number of parallel scans to perform.                       |
| `--timeout`       | `-t`  | Number  | 5000                       | Timeout for each connection in milliseconds.               |
| `--help`          | `-h`  | Boolean |                            | Displays the help message.                                 |

### Basic Scan:

`./run -i "./data/input-small.csv`

### Scan with Custom Certificate Store and Timeout:

`./run -i "./data/input.csv" -c "./data/custom.pem" -t 10000`

## 2. Running the Analyzer Seperately

The analyzer is called automatically when running the scanner. If you decide to run the analyzer seperately:
Run the analyzer via npm:

`npm run analyze`

Make sure the `logFilePath` specified during the scan matches the input for the analyzer.

This will result in an `analysis-results.json`file, with the full analysis.
