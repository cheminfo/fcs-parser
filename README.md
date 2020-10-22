# Flow Cytometry Standard

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Read encoded data from flow cytometry experiments.

Available versions:
- 2.0
- 3.0
- 3.1

## Installation

`$ npm i fcs`

## Usage

```js
import { readFileSync } from 'fs';

import { parseFCS } from 'fcs';

const buffer = readFileSync('pathToFile');
let parsed = parseFCS(buffer);
console.log(parsed);
```

## [API Documentation](https://cheminfo.github.io/fcs/)

## References
* Spidlen, J., Moore, W., Parks, D., Goldberg, M., Bray, C., Bierre, P., ... & Lefebvre, R. (2010). Data file standard for flow cytometry, version FCS 3.1. Cytometry Part A: The Journal of the International Society for Advancement of Cytometry, 77(1), 97-100.

* [Wikipedia](https://en.wikipedia.org/wiki/Flow_Cytometry_Standard).

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/fcs.svg
[npm-url]: https://www.npmjs.com/package/fcs
[ci-image]: https://github.com/cheminfo/fcs/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/cheminfo/fcs/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/fcs.svg
[codecov-url]: https://codecov.io/gh/cheminfo/fcs
[download-image]: https://img.shields.io/npm/dm/fcs.svg
[download-url]: https://www.npmjs.com/package/fcs
