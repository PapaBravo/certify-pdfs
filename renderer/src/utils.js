const toArray = require('stream-to-array');

/**
 * @param {Stream} stream 
 * @returns {Promise<Buffer>}
 */
async function streamToBuffer(stream) {
    let parts = await toArray(stream);
    let buffers = [];
    for (let i = 0, l = parts.length; i < l; ++i) {
        let part = parts[i]
        buffers.push((part instanceof Buffer) ? part : Buffer.from(part))
    }
    return Buffer.concat(buffers);
}

module.exports = {
    streamToBuffer
};