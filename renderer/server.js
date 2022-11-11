'use strict';

const { ObjectStorage } = require('./src/objectStorage');
const { KeyValueStore } = require('./src/keyValueStore');
const { getNextJob } = require('./src/controller');

async function main() {
    await ObjectStorage.getInstance();
    await KeyValueStore.getInstance();
    await getNextJob();
}

main();