const logger = require('./logger');
const jose = require('node-jose');
const { config } = require('./config');

const kid = 'test-sign-key';

class Certifier {

    static instance = null;

    constructor(keystore) {
        this.keystore = keystore;
    }

    static async createAsyncInstance() {
        try {
            const keystore = jose.JWK.createKeyStore();
            let importedKey = (await jose.JWK.asKey(config.context.publicSignKey, "pem")).toJSON(false);
            importedKey.kid = kid;
            await keystore.add(importedKey);
            return new Certifier(keystore);
        } catch (err) {
            logger.error('Failed to create key store: %s', err.message);
            Certifier.instance = null;
            throw err;
        }
    }

    /**
     * @returns {Promise<Certifier>}
     */
    static async getInstance() {
        if (Certifier.instance) return Certifier.instance;

        Certifier.instance = Certifier.createAsyncInstance();
        return Certifier.instance;
    }

    /**
     * 
     * @param {string | Buffer} claim 
     * @returns {Promise<string>} Signature and payload in compact format
     * @throws Error if keystore not initialized
     */
    async sign(claim) {
        if (!this.keystore) throw new Error('Keystore not initialized.');

        let signature = await jose.JWS
            .createSign({ format: 'compact' }, this.keystore.get(kid))
            .update(claim)
            .final();
        return signature;
    }

    /**
     * 
     * @param {string} signature 
     * @returns {Boolean | string} The embedded claim or false
     * @throws Error if keystore not initialized
     * 
     */
    async verify(signature) {
        if (!this.keystore) throw new Error('Keystore not initialized.');

        try {
            const verification = await jose.JWS
                .createVerify(this.keystore.get(kid))
                .verify(signature);

            if (verification && verification.key && verification.key.kid === kid) {
                return verification.payload.toString('utf8');
            }
        } catch (err) {
            return false;
        }
        return false;
    }

    /**
     * 
     * @returns {Object} A object describing the public key
     * @throws Error if keystore not initialized
     * 
     */
    getPublicKey() {
        if (!this.keystore) throw new Error('Keystore not initialized.');
        return this.keystore.get(kid).toJSON();
    }
}

module.exports = {
    Certifier
};