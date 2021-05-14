function load(url) {
    const options = {
        includesHeader: true,
        delimiter: ','
    };

    const update = (progress) => {
        console.log('progress:', progress);
    };

    // eslint-disable-next-line no-undef
    csv.loadUrl(url, options, update, csv.TypeDeduction.KeepAll);
}

fetch('/conf.json').then((c) => {
    c.text().then((t) => {
        const json = JSON.parse(t);
        load(json.url);
    });
});

