const { createClient } = require('redis');
const { config } = require('./config');

const redisConfig = {
    username: config.redis.user,
    password: config.redis.password,
    socket: {
      host: config.redis.host,
      port: config.redis.port
    }
  }

class KeyValueStore {

    static instance = null;

    constructor(redis) {
        console.log('key value client created');
        this.redis = redis;
    }

    static async createAsyncInstance() {
        try {
            const redis = createClient(redisConfig);
            await redis.connect();
            console.log('renderer connected to key value store');

            return new KeyValueStore(redis);
        } catch (err) {
            console.error('Renderer failed to connect to key value store', err);
            KeyValueStore.instance = null;
            throw err;
        }
    }

    static async getInstance() {
        if (KeyValueStore.instance) return KeyValueStore.instance;

        KeyValueStore.instance = KeyValueStore.createAsyncInstance();
        return KeyValueStore.instance;
    }

    async pop(key) {
        // timeout = 0 means blocking forever
        return await this.redis.BRPOP(key, 0);
    }

    async getJSON(key) {
        return await this.redis.HGETALL(key);
    }
    
    /**
     * 
     * @param {string | string[]} key 
     * @param {object | object[]} data field-value-map
     * @returns 
     */
    async setJSON(key, data) {
        if (typeof key === 'string') {
            return await this.redis.HSET(key, data);
        } else {
            if (key.length != data.length ) {
                throw new Error('Key and data must have the same length');
            }

            let multi = await this.redis.multi();

            for (let i = 0; i < key.length; i++) {
                await multi.HSET(key[i], data[i]);
            }
            return await multi.exec();
        }
    }
}

module.exports = {
    KeyValueStore
}

