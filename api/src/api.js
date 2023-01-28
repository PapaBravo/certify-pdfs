const logger = require('./logger');
const { Certifier } = require('./certifier');
const { KeyValueStore } = require('./keyValueStore');
const { config } = require('./config');


const { randomUUID } = require('crypto');

const express = require('express');
const router = express.Router();

router.post('/sign', async (req, res) => {
    let keyValueStore = await KeyValueStore.getInstance();
    logger.info('Starting to sign doc for %o', req.body);
    let { claim, documentKey } = req.body;
    let jobID = randomUUID();
  
    const jobData = { claim, documentKey, status: "WAITING", date: new Date().toISOString() };
  
    try {
      let transaction = await keyValueStore.getTransaction();
      transaction
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
  
  router.post('/verify', async (req, res) => {
    logger.info('verify called');
    let certifier = await Certifier.getInstance();
    let { signature } = req.body;
    let verification = await certifier.verify(signature);
  
    if (verification) {
      res.status(200).send(JSON.parse(verification));
    } else {
      res.status(400).send({ message: 'Could not verify' });
    }
  });
  
  router.get('/public-key', async (req, res) => {
    let certifier = await Certifier.getInstance();
    let key = certifier.getPublicKey();
    res.status(200).send({ key });
  });
  
  router.get('/job/:id', async (req, res) => {
    const jobID = req.params.id;
    let keyValueStore = await KeyValueStore.getInstance();
    let job = await keyValueStore.getJSON(`${config.redis.jobsKeyPrefix}${jobID}`);
    res.status(200).send(job);
  });

module.exports = router;