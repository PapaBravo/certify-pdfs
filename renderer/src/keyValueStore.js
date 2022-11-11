const { createClient } = require('redis');

const redisConfig = {
    username: 'default',
    password: 'sOmE_sEcUrE_pAsS',
    socket: {
        host: 'redis',
        port: '6379'
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

    async getJSON(key, path) {
        return await this.redis.json.get(key, path);
    }

    async setJSON(key, path, value) {
        return await this.redis.json.get(key, path.value);
    }

}

module.exports = {
    KeyValueStore
}

