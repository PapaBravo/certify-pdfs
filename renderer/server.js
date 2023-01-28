'use strict';

const logger = require('./src/logger');
const { ObjectStorage } = require('./src/objectStorage');
const { KeyValueStore } = require('./src/keyValueStore');
const { getNextJob } = require('./src/controller');

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
  
Object.keys(SIGNALS).forEach((signal) => {
    process.on(signal, () => {
        logger.info(`process received a ${signal} signal`);
        process.exit(0);
    });
});

async function main() {
    await ObjectStorage.getInstance();
    await KeyValueStore.getInstance();
    logger.info('Initialized');
    getNextJob();
}

main();