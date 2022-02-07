## v0.2.2

### Bug Fixes

-   [#31](https://github.com/lukaswagner/csv-parser/pull/31): Fixed number of lines used for type inference

## v0.2.1

### Bug Fixes

-   [#29](https://github.com/lukaswagner/csv-parser/issues/29): Fixed `BaseColumn` `get`/`set` functions.

## v0.2

### Features

-   [#12](https://github.com/lukaswagner/csv-parser/issues/12): Added date columns.
-   [#23](https://github.com/lukaswagner/csv-parser/issues/23), [#28](https://github.com/lukaswagner/csv-parser/issues/28): Added `view` accessor to all chunks which store a buffer view internally.

### Bug Fixes

-   [#22](https://github.com/lukaswagner/csv-parser/issues/22): Calling `rebuildColumn` now rebuilds the underlying chunks as well.

### Chores

-   [#21](https://github.com/lukaswagner/csv-parser/issues/21): Include `README.md` and `LICENSE` in npm releases.
