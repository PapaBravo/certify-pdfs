const Minio = require('minio');
const { streamToBuffer } = require('./utils');

const minio = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
})

class ObjectStorage {

    static instance = null;

    constructor() {
        console.log('object storage client created');
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

