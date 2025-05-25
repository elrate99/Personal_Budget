const converts = require('./data')

const findById = (id) => {
    const result = converts.find(convert => convert.id === Number(id));
    if (!result) {
        return res.status(404).json({error: 'Item not found!'})
    }
    return result;
}

const findByName = (name) => {
    const result = converts.find(convert => convert.header.toLowerCase() === name.toLowerCase());
    if (!result) {
        return res.status(404).json({error: 'Item not found!'})
    }
    return result;
}

module.exports = {findById, findByName}