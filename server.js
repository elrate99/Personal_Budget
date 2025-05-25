const express = require('express');

const app = express();
const morgan = require('morgan');
const PORT = process.env.PORT || 4001;

app.use(express.static('public'));
app.use(morgan('dev'));
const envelopesRouter = require('./envelopes');
app.use('/api/envelopes', envelopesRouter)


app.listen(PORT, () => {
    console.log(`The server is running on ${PORT} port.`)
})