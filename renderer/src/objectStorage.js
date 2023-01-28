const Minio = require('minio');
const { streamToBuffer } = require('./utils');
const { config } = require('./config');
const logger = require('./logger');

const minio = new Minio.Client({
    endPoint: config.minio.host,
    port: config.minio.port,
    useSSL: false,
    accessKey: config.minio.user,
    secretKey: config.minio.password
})

class ObjectStorage {

    static instance = null;

    constructor() {
    }

    /**
     * 
     * @param {String} bucket 
     * @param {String} key 
     * @param {String | Buffer | ReadableStream} buffer 
     * @returns {Promise<Object>} with information about the object
     */
    async putObject(bucket, key, buffer) {
        let objInfo = await minio.putObject(bucket, key, buffer);
        return objInfo;
    }

    /**
     * 
     * @param {String} bucket 
     * @param {String} key 
     * @returns {Promise<Buffer>}
     */
    async getObject(bucket, key) {
        let stream = await minio.getObject(bucket, key);
        return streamToBuffer(stream);
    }

    static async createAsyncInstance() {
        try {
            logger.info('Creating new minio client.');
            return new ObjectStorage();
        } catch (err) {
            ObjectStorage.instance = null;
            throw err;
        }
    }

    static async getInstance() {
        if (ObjectStorage.instance) return ObjectStorage.instance;

        ObjectStorage.instance = ObjectStorage.createAsyncInstance();
        return ObjectStorage.instance;
    }
}

module.exports = {
    ObjectStorage
}