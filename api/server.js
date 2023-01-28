'use strict';

const logger = require('./src/logger');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { KeyValueStore } = require('./src/keyValueStore');

const { config } = require('./src/config');
const { Certifier } = require('./src/certifier');
const api = require('./src/api');

// Constants
const PORT = config.app.port;
const HOST = '0.0.0.0';

const SIGNALS = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: %o At %s', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection: %o At %s', err.message, err.stack);
  process.exit(1);
});

const corsOptions = {
  origin: config.app.allowedOrigins,
}

// App
const app = express();

app.use(cors(corsOptions));
app.options('*', cors());

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.status(200);
  res.send('ok');
});

app.use('/api/v1', api);

async function main() {
  try {
    await KeyValueStore.getInstance();    
    await Certifier.getInstance();
    app.listen(PORT, HOST, () => {
      logger.info(`Running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    logger.error('Api failed to initialize: %s', err.message);
  }
}

Object.keys(SIGNALS).forEach((signal) => {
  process.on(signal, () => {
    logger.info(`process received a ${signal} signal`);
    process.exit(0);
  });
});

main();