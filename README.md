# csv-parser

Quick, multi-threaded CSV parser with focus on handling huge files.

![build+lint badge](https://github.com/lukaswagner/csv-parser/actions/workflows/ci.yml/badge.svg)

## Features

-   **Quick:** Loads a 400MB CSV (5 float columns, 10M rows) in 8 seconds (on an i7-4790K). [Papa Parse](https://www.papaparse.com/), which claims to be the fastest CSV parser in the browser took twice as long to parse the same file on the same system &ndash; when parsing everything as strings. When enabling type parsing, it took over a minute.
-   **Supports preprocessing the data:** Loading the data first and processing it later can waste RAM by storing columns which you don't actually need. Instead, you can specify generator functions to create custom columns from the parsed input data, allowing you to immediately discard it afterwards to reduce memory usage.
-   **Data is returned in chunks:** Especially for very large files (multiple GB), you may want to work with the available data before everything is parsed. This also allows the usage of infinite data streams.
-   **Sensible data storage:** All scalar data is stored as [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) with `SharedArrayBuffer`s as underlying storage. This has multiple advantages:
    -   Lower memory footprint: You can choose the required byte size of your buffer. Depending on your requirements, this can drastically reduce memory usage in comparison to an array of numbers (each being a 64-bit float). But even when using a `Float64Array`, the memory usage tends to be less, as each `number` in the respective the `Array<number>` typically measures [more than 8 bytes](https://blog.dashlane.com/how-is-data-stored-in-v8-js-engine-memory/#BlogArticle-HowisdatastoredinV8JSenginememory?-PrimitiveTypes).
    -   Easier usage of low-level interfaces, such as sending data to the [GPU with WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData).
    -   `SharedArrayBuffer` allows multiple threads (workers) to access the data without duplicating it.

## Usage

See the [`apps` directory](https://github.com/lukaswagner/csv-parser/tree/master/apps) for multiple example implementations using the parser.

## Important implementation notes and limitations

-   As this parser uses `SharedArrayBuffer`s, you'll need to add [two security headers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements) when hosting your website.
-   Chrome only ever allows a tab to use 4GB of RAM, even when running on 64-bit machines. This means when parsing big files, you may run into issues with your tab crashing with a `STATUS_BREAKPOINT` error message. Example: Parsing a 2GB file with 5 32-bit float columns and 50M rows, the parsed arrays will measure roughly 1GB. During parsing, the memory consumption can approach 4GB due to intermediate values being created. As a workaround for this limitation, you can use Firefox, which does allow using more than 4GB RAM.
