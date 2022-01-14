import express from 'express';

const app = express();
const options = {
    setHeaders: function (res) {
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    },
};
app.use(express.static('.', options));
app.use(express.static('../../packages/csv-parser/lib', options));
app.use(express.static('../data', options));
app.listen(8080);
