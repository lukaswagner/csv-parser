const express = require('express')
const app = express()
app.use(express.static('.'));
app.use(express.static('../../lib/bundled'));
app.listen(8080);
