const pino = require('pino');

const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            singleLine: true
        }
    }
});

module.exports = logger;