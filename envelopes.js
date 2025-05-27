const express = require('express');
const envelopesRouter = express.Router();
const {converts, budget} = require('./data');
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
    request.amount = 0;
    request.id = idCounter++;
    if (request.header && request.convert) {
        converts.push(request);
        res.status(201).send(request);
    } else {
        res.status(400).send();
    }
})

envelopesRouter.delete('/:id', (req, res, next) => {
    const id = req.convertById.id;
    const index = converts.findIndex(elem => elem.id === id);
    if (index !== -1) {
        const deletedAmount = parseFloat(converts[index].amount) || 0;
        budget.budget += deletedAmount; // Возвращаем сумму в бюджет
        converts.splice(index, 1);
        res.status(200).send({message: 'Content was deleted!'});
    } else {
        res.status(404).send({message: 'Convert not found!'});
    }
});

envelopesRouter.put('/budget/:budget', (req, res, next) => {
    const budgetValue = Number(req.params.budget);
    if (isNaN(budgetValue)) {
        return res.status(400).send({ message: 'Budget must be a number' });
    }
    budget.budget = budgetValue;
    res.send({ budget: budget.budget })
})

envelopesRouter.get('/budget', (req, res, next) => {
    res.send({budget: budget.budget});
})

envelopesRouter.put('/transfer/:fromId/:toId', (req, res, next) => {
    const {fromId, toId} = req.params;
    const {amount} = req.query;

    const fromEnvelope = converts.find(convert => convert.id === Number(fromId));
    const toEnvelope = converts.find(convert => convert.id === Number(toId));

    if(!fromEnvelope || !toEnvelope) {
        return res.status(404).send({ message: 'One of the converts not found!'})
    }
    
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return res.status(400).send({ message: 'Invalid amount' });
    }

    const fromBalance = Number(fromEnvelope.amount) || 0;
    if (fromBalance < numericAmount) {
        return res.status(400).send({ message: 'Not enough funds in source envelope' });
    }

    fromEnvelope.amount = (fromBalance - numericAmount)
    toEnvelope.amount = (Number(toEnvelope.amount) + numericAmount);

    res.send({
        message: 'Transfer successful',
        fromEnvelope,
        toEnvelope
    });
})

envelopesRouter.put('/:id', (req, res, next) => {
    const { header, convert, action, amount } = req.query;
    const foundedConvert = req.convertById;

    // Редактирование заголовка и описания
    if (header || convert) {
        if (header) foundedConvert.header = header;
        if (convert) foundedConvert.convert = convert;
        return res.send(converts);
    }

    // Операции с балансом
    if (action && amount) {
        const numericAmount = Number(amount);
        const currentAmount = Number(foundedConvert.amount) || 0;

        if (isNaN(numericAmount)) {
            return res.status(400).send({ message: 'Invalid amount' });
        }

        if (action === 'deposit') {
            if(budget.budget < numericAmount) {
                return res.status(400).send({ message: `Not enough budget. Available: ${budget.budget} EUR.`})
            }
            foundedConvert.amount = (currentAmount + numericAmount).toString();
            budget.budget -= numericAmount;
        } else if (action === 'withdraw') {
            if (currentAmount < numericAmount) {
                return res.status(400).send({ message: 'Not enough funds' });
            }
            foundedConvert.amount = (currentAmount - numericAmount).toString();
            budget.budget += numericAmount;
        } else {
            return res.status(400).send({ message: 'Invalid action' }); // Добавьте эту проверку
        }

        return res.send(converts);
    }

    // Если запрос не содержит валидных параметров
    return res.status(400).send({ message: 'No valid parameters provided' });
});


module.exports = envelopesRouter;