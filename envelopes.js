const express = require('express');
const envelopesRouter = express.Router();
const converts = require('./data');
const {findById, findByName} = require('./utils');
let idCounter = 8;

envelopesRouter.param('id', (req, res, next, id) => {
    const envelope = findById(id)
    req.convertById = envelope;
    next();
});

envelopesRouter.param('name', (req, res, next, name) => {
    const envelope = findByName(name)
    req.convertByName = envelope;
    next();
})

envelopesRouter.get('/', (req, res, next) => {
    res.send(converts);
});

envelopesRouter.get('/id/:id', (req, res, next) => {
    res.send([req.convertById])
});

envelopesRouter.get('/name/:name', (req, res, next) => {
    res.send([req.convertByName])
})

envelopesRouter.post('/', (req, res, next) => {
    const request = req.query;
    request.id = idCounter++;
    if (request.header && request.convert && request.amount) {
        converts.push(request);
        res.status(201).send();
    } else {
        res.status(400).send();
    }
})

envelopesRouter.delete('/:id', (req, res, next) => {
    const id = req.convertById.id
    const index = converts.findIndex(elem => elem.id === id);
    if (index !== -1) {
        converts.splice(index, 1);
        res.status(200).send({message: 'Content was deleted!'})
    } else {
        res.status(404).send({message: 'Convert not found!'})
    }
})


module.exports = envelopesRouter;