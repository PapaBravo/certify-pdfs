'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('redis');

const { randomUUID } = require('crypto');

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

// Redis connection
const redis = createClient(redisConfig);

// App
const app = express();

app.use(bodyParser.json())

app.get('/', async (req, res) => {
  try {
    await redis.set('key', new Date().toISOString());
    const value = await redis.get('key');
    res.send(value);
  } catch (err) {
    res.status(400);
    res.send(err.message);
  }
});

app.post('/sign', async (req, res) => {
  console.log('sign called');
  let { claim, documentKey } = req.body;
  let jobID = randomUUID();

  const jobData = { claim, documentKey, status: "WAITING", date: new Date().toISOString() };

  try {
    await redis.multi()
      .json.set(`jobs:${jobID}`, '$', jobData, { NX: true })
      .LPUSH('queue', jobID)
      .exec();
    console.log('Written', jobID, jobData);

    res.status(200);
    res.send(jobID);
  } catch (err) {
    res.status(400);
    res.send(err.message);
  }
});

async function main() {
  try {
    await redis.connect();
    console.log('api connected to redis');
  } catch (err) {
    console.error('Api failed to connect to redis', err);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });
}

main();