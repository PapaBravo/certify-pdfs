const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            singleLine: true
        }
    }
});

const expressLogger = pinoHttp({
    logger: logger,
    autoLogging: {
        ignore: req => req.url === '/' && req.headers['user-agent'].startsWith('kube-probe/')
    }
});

module.exports = {
    expressLogger,
    logger
};