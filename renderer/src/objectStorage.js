const Minio = require('minio');

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
     * @param {String | Buffer} buffer 
     * @returns {Promise}
     */
    async putObject(bucket, key, buffer) {
        return new Promise(function (resolve, reject) {
            minio.putObject(bucket, key, buffer, function (err) {
                if (err) {
                    console.error('Could not put object', err);
                    reject(err);
                } else resolve();
            })
        });
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

