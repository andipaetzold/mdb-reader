## [1.0.4](https://github.com/andipaetzold/mdb-reader/compare/v1.0.3...v1.0.4) (2021-10-04)


### Bug Fixes

* max precision for money & numeric data ([9744b6c](https://github.com/andipaetzold/mdb-reader/commit/9744b6cd256edb8a27a26670deb2f2e27c2702cb))

## [1.0.3](https://github.com/andipaetzold/mdb-reader/compare/v1.0.2...v1.0.3) (2021-09-07)


### Bug Fixes

* null values in tables with deleted columns ([#97](https://github.com/andipaetzold/mdb-reader/issues/97)) ([cb95282](https://github.com/andipaetzold/mdb-reader/commit/cb9528200b8d7fb9d3cceee59881391e2a1b74e9))

## [1.0.2](https://github.com/andipaetzold/mdb-reader/compare/v1.0.1...v1.0.2) (2021-08-17)


### Bug Fixes

* error message when page has unexpected type ([5d753e6](https://github.com/andipaetzold/mdb-reader/commit/5d753e69c0e462f77925165ef1d4982c0a289863))

## [1.0.1](https://github.com/andipaetzold/mdb-reader/compare/v1.0.0...v1.0.1) (2021-07-03)


### Bug Fixes

* remove engines.node ([4f22a35](https://github.com/andipaetzold/mdb-reader/commit/4f22a357f0f3cfad71d68b66dc42ef312d92bd80))

# [1.0.0](https://github.com/andipaetzold/mdb-reader/compare/v0.2.0...v1.0.0) (2021-06-02)


### BREAKING CHANGES

* drop support of node v10 & v15; add v16 support ([#75](https://github.com/andipaetzold/mdb-reader/issues/75)) ([6f894b6](https://github.com/andipaetzold/mdb-reader/commit/6f894b6b944411c7f207fdac0eb61917d6ac30d7))
    * node 10 (LTS) is EOL
    * node 15 is EOL
    * node 16 is current

# [0.2.0](https://github.com/andipaetzold/mdb-reader/compare/v0.1.7...v0.2.0) (2021-03-31)


### Features

* support Access 2019 ([#54](https://github.com/andipaetzold/mdb-reader/issues/54)) ([1b9a3f0](https://github.com/andipaetzold/mdb-reader/commit/1b9a3f09c77e46a5dac2d03dd2d957e01c9e4415))

## [0.1.7](https://github.com/andipaetzold/mdb-reader/compare/v0.1.6...v0.1.7) (2021-03-25)


### Bug Fixes

* move tslib to dev dependencies ([#50](https://github.com/andipaetzold/mdb-reader/issues/50)) ([0bcf82a](https://github.com/andipaetzold/mdb-reader/commit/0bcf82afda2764fdcdb5ea1bebd1605df488890a))

## [0.1.6](https://github.com/andipaetzold/mdb-reader/compare/v0.1.5...v0.1.6) (2021-03-25)


### Bug Fixes

* move @types/node to dev dependencies ([#49](https://github.com/andipaetzold/mdb-reader/issues/49)) ([a70ea2c](https://github.com/andipaetzold/mdb-reader/commit/a70ea2ca14d31b3ed09b69fe23c903a236deca92))

## [0.1.5](https://github.com/andipaetzold/mdb-reader/compare/v0.1.4...v0.1.5) (2021-03-18)


### Bug Fixes

* RangeError & empty array when using getData with rowOffset ([#46](https://github.com/andipaetzold/mdb-reader/issues/46)) ([82fd481](https://github.com/andipaetzold/mdb-reader/commit/82fd4811b983bbd902f2fc215c5a614cd57ca828))

## [0.1.4](https://github.com/andipaetzold/mdb-reader/compare/v0.1.3...v0.1.4) (2021-03-12)


### Bug Fixes

* read byte as unsigned number ([#41](https://github.com/andipaetzold/mdb-reader/issues/41)) ([8795dd0](https://github.com/andipaetzold/mdb-reader/commit/8795dd02608cf15e808590ac12b7c95df9a85323))

## [0.1.3](https://github.com/andipaetzold/mdb-reader/compare/v0.1.2...v0.1.3) (2020-12-02)


### Bug Fixes

* set rollup output.exports to default for cjs ([5d4d311](https://github.com/andipaetzold/mdb-reader/commit/5d4d3119bcb7fbab656e38cca0bf55f367c30821))
* use types prop in package.json for type defs ([7616862](https://github.com/andipaetzold/mdb-reader/commit/76168629d01b167c4b13cfb81a2a11790940bbd3))
