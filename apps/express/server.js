const express = require('express');
const app = express();
app.use(express.static('.'));
app.use(express.static('../../lib/standalone'));
app.use('/conf.json', express.static('../conf.json'));
app.listen(8080);
