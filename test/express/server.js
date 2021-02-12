const express = require('express')
const app = express()
app.use(express.static('.'));
app.use(express.static('../../lib'));
app.listen(8080);
