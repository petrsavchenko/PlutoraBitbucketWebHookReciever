const express = require('express')
const bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send(JSON.stringify(req.body)));

app.post('/hook', (req, res) => { console.log(req.body); res.sendStatus(200)});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));