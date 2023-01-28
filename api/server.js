'use strict';

const logger = require('./logger');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('redis');
const { randomUUID } = require('crypto');

const { config } = require('./config');
const { Certifier } = require('./certifier');

// Constants
const PORT = config.app.port;
const HOST = '0.0.0.0';

const SIGNALS = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: %o At %s', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection: %o At %s', err.message, err.stack);
  process.exit(1);
});

const redisConfig = {
  username: config.redis.user,
  password: config.redis.password,
  socket: {
    host: config.redis.host,
    port: config.redis.port
  }
}

const corsOptions = {
  origin: config.app.allowedOrigins,
}

// Redis connection
const redis = createClient(redisConfig);
let certifier;

// App
const app = express();

app.use(cors(corsOptions));
app.options('*', cors());

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.status(200);
  res.send('ok');
});

app.post('/api/v1/sign', async (req, res) => {
  logger.info('Starting to sign doc for %o', req.body);
  let { claim, documentKey } = req.body;
  let jobID = randomUUID();

  const jobData = { claim, documentKey, status: "WAITING", date: new Date().toISOString() };

  try {
    await redis.multi()
      .HSET(`${config.redis.jobsKeyPrefix}${jobID}`, jobData, {NX: true})
      .LPUSH(config.redis.queueKey, jobID)
      .exec();
    logger.info('Written job %s', jobID);

    res.status(200);
    res.send({ jobID });
  } catch (err) {
    res.status(400);
    logger.error("Error signing document: %s", err.message);
    res.send({message: "Error signing document: " + err.message});
  }
});

app.post('/api/v1/verify', async (req, res) => {
  logger.info('verify called');
  let { signature } = req.body;
  let verification = await certifier.verify(signature);

  if (verification) {
    res.status(200).send(JSON.parse(verification));
  } else {
    res.status(400).send({ message: 'Could not verify' });
  }
});

app.get('/api/v1/public-key', async (req, res) => {
  let key = certifier.getPublicKey();
  res.status(200).send({ key });
});

app.get('/api/v1/job/:id', async (req, res) => {
  const jobID = req.params.id;
  let job = await redis.HGETALL(`${config.redis.jobsKeyPrefix}${jobID}`);
  res.status(200).send(job);
});

async function main() {
  try {
    await redis.connect();
    logger.info('api connected to redis');
    certifier = await Certifier.getInstance();
    logger.info('api initialized key store');
    app.listen(PORT, HOST, () => {
      logger.info(`Running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    logger.error('Api failed to initialize: %s', err.message);
  }
}

Object.keys(SIGNALS).forEach((signal) => {
  process.on(signal, () => {
    logger.info(`process received a ${signal} signal`);
    process.exit(0);
  });
});

main();