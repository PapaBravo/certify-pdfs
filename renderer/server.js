'use strict';

const { ObjectStorage } = require('./src/objectStorage');
const { KeyValueStore } = require('./src/keyValueStore');
const { getNextJob } = require('./src/controller');

const SIGNALS = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGTERM': 15
};

async function main() {
    await ObjectStorage.getInstance();
    await KeyValueStore.getInstance();
    getNextJob();
}

main();

Object.keys(SIGNALS).forEach((signal) => {
    process.on(signal, () => {
        console.log(`process received a ${signal} signal`);
        process.exit(0);
    });
});