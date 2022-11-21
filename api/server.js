'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('redis');
const { randomUUID } = require('crypto');

const { Certifier } = require('./certifier');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const redisConfig = {
  username: 'default',
  password: 'sOmE_sEcUrE_pAsS',
  socket: {
    host: 'redis',
    port: '6379'
  }
}

const corsOptions = {
  origin: ['http://localhost:8081'],
}

// Redis connection
const redis = createClient(redisConfig);
let certifier;

// App
const app = express();

app.use(cors(corsOptions));
app.options('*', cors());

app.use(bodyParser.json())

app.post('/api/v1/sign', async (req, res) => {
  let { claim, documentKey } = req.body;
  let jobID = randomUUID();

  const jobData = { claim, documentKey, status: "WAITING", date: new Date().toISOString() };

  try {
    await redis.multi()
      .json.set(`jobs:${jobID}`, '$', jobData, { NX: true })
      .LPUSH('queue', jobID)
      .exec();
    console.log('Written', jobID);

    res.status(200);
    res.send(jobID);
  } catch (err) {
    res.status(400);
    res.send(err.message);
  }
});

app.post('/api/v1/verify', async (req, res) => {
  console.log('verify called');
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
  res.status(200).send({key});
});

async function main() {
  try {
    await redis.connect();
    console.log('api connected to redis');
    certifier = await Certifier.getInstance();
    console.log('api initialized key store');
    app.listen(PORT, HOST, () => {
      console.log(`Running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Api failed to initialize', err);
  }
}

main();