import express from 'express';

const app = express();
const options = {
    setHeaders: function (res) {
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    },
};
app.use(express.static('./dist', options));
app.use(express.static('../data', options));
app.listen(process.env.PORT);
