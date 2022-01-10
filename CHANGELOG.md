# [2.0.0-next.10](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.9...v2.0.0-next.10) (2022-01-08)


### Features

* add `getCreationDate` ([dbd4a25](https://github.com/andipaetzold/mdb-reader/commit/dbd4a257290c4007d39ed6092da683e6e8e51863))
* add `getDefaultSortOrder` ([3a1d879](https://github.com/andipaetzold/mdb-reader/commit/3a1d879af4180813bfbf3b29953475a163763e2b))
* add `getPassword` ([8500f18](https://github.com/andipaetzold/mdb-reader/commit/8500f18cace8c4de8c974d75a552654787d18429))
* decrypt "protected" mdb files ([ad17ae3](https://github.com/andipaetzold/mdb-reader/commit/ad17ae3c62e94e2ada69d00a439c38d9e488836c)), closes [#90](https://github.com/andipaetzold/mdb-reader/issues/90)
* make ColumnType an enum & export ValueMap ([332fa99](https://github.com/andipaetzold/mdb-reader/commit/332fa9956fcb0cc0b6d36040c9090bdaf617be99))

# [2.0.0-next.9](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.8...v2.0.0-next.9) (2021-12-30)


### Features

* support DateTimeExtended ([#145](https://github.com/andipaetzold/mdb-reader/issues/145)) ([001045e](https://github.com/andipaetzold/mdb-reader/commit/001045eb3c416828f422fe58664b10b615ff2e3c))

# [2.0.0-next.8](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.7...v2.0.0-next.8) (2021-12-30)


### Bug Fixes

* fully specify file paths in imports ([c9ce276](https://github.com/andipaetzold/mdb-reader/commit/c9ce276c207d3d7aabd3fa13c1beb9c8fdf1e14f))

# [2.0.0-next.7](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.6...v2.0.0-next.7) (2021-12-21)


### Bug Fixes

* export `Value` type ([61d1b02](https://github.com/andipaetzold/mdb-reader/commit/61d1b028acf8c131889ddb40cdb6185dcd374c93))


### Features

* make package ESM only ([b207dbe](https://github.com/andipaetzold/mdb-reader/commit/b207dbe8c8b3fb7eb1aee8d23bb68c7977137a6d))


### BREAKING CHANGES

* make package ESM only

# [2.0.0-next.6](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.5...v2.0.0-next.6) (2021-11-16)


### Bug Fixes

* handle tables with over 256 cols (incl. deleted) ([#111](https://github.com/andipaetzold/mdb-reader/issues/111)) ([e5f0d19](https://github.com/andipaetzold/mdb-reader/commit/e5f0d1911df6917a86fe0daa5047a8284ba9fe4a))
* incorrect boolean values in tables with inserted columns ([#124](https://github.com/andipaetzold/mdb-reader/issues/124)) ([0d4b78c](https://github.com/andipaetzold/mdb-reader/commit/0d4b78cc14b26ea0fcfbbe6768dae5ed3a418936))
* mixed endianness of guids ([#118](https://github.com/andipaetzold/mdb-reader/issues/118)) ([ac7790c](https://github.com/andipaetzold/mdb-reader/commit/ac7790c3888156f68a8503b94f647ad447d4fef2))
* round milliseconds in datetime parser ([#123](https://github.com/andipaetzold/mdb-reader/issues/123)) ([b1b4379](https://github.com/andipaetzold/mdb-reader/commit/b1b4379b830041c6a725b67d165d0811e98d8a67))

# [2.0.0-next.5](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.4...v2.0.0-next.5) (2021-10-16)


* feat!: do not publish bundled version (#114) ([7d3fd1b](https://github.com/andipaetzold/mdb-reader/commit/7d3fd1b96b76e2dd80ab22cc3d0f0a7370c503a1)), closes [#114](https://github.com/andipaetzold/mdb-reader/issues/114)


### BREAKING CHANGES

* The package doesn't include a bundled version anymore

# [2.0.0-next.4](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.3...v2.0.0-next.4) (2021-10-11)


* feat!: remove MDBReader.getFormat() (#112) ([7600737](https://github.com/andipaetzold/mdb-reader/commit/76007376b63382af9f3bf64cc1125867a429b35f)), closes [#112](https://github.com/andipaetzold/mdb-reader/issues/112)


### BREAKING CHANGES

* remove MDBReader.getFormat()

# [2.0.0-next.3](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.2...v2.0.0-next.3) (2021-10-11)


### Bug Fixes

* don't throw for BigInt and Date/Time Extended ([e02ef3a](https://github.com/andipaetzold/mdb-reader/commit/e02ef3a2f1be14c8333798848fed4118303929bc))

# [2.0.0-next.2](https://github.com/andipaetzold/mdb-reader/compare/v2.0.0-next.1...v2.0.0-next.2) (2021-10-10)


### Features

* support BigInt ([#109](https://github.com/andipaetzold/mdb-reader/issues/109)) ([7f78777](https://github.com/andipaetzold/mdb-reader/commit/7f78777b568c57f18832f0a6a84b4e347fc28777))

# [2.0.0-next.1](https://github.com/andipaetzold/mdb-reader/compare/v1.0.4...v2.0.0-next.1) (2021-10-10)


### Features

* drop node 12 support ([#110](https://github.com/andipaetzold/mdb-reader/issues/110)) ([05e7952](https://github.com/andipaetzold/mdb-reader/commit/05e795272972b6217f98d27397c56b51b01ec877))


## [1.2.1](https://github.com/andipaetzold/mdb-reader/compare/v1.2.0...v1.2.1) (2022-01-10)


### Bug Fixes

* deprecate `.buffer` ([e03efb6](https://github.com/andipaetzold/mdb-reader/commit/e03efb63ab98508c2398287f2c4877200ec5c85a))
* do not modify input buffer ([de062b2](https://github.com/andipaetzold/mdb-reader/commit/de062b2740755c429e3db21b52649d5d2782315c))

# [1.2.0](https://github.com/andipaetzold/mdb-reader/compare/v1.1.0...v1.2.0) (2022-01-08)


### Features

* add `getDefaultSortOrder` ([3a1d879](https://github.com/andipaetzold/mdb-reader/commit/3a1d879af4180813bfbf3b29953475a163763e2b))
* add `getPassword` ([8500f18](https://github.com/andipaetzold/mdb-reader/commit/8500f18cace8c4de8c974d75a552654787d18429))

# [1.1.0](https://github.com/andipaetzold/mdb-reader/compare/v1.0.10...v1.1.0) (2022-01-06)


### Features

* add `getCreationDate` ([dbd4a25](https://github.com/andipaetzold/mdb-reader/commit/dbd4a257290c4007d39ed6092da683e6e8e51863))
* decrypt "protected" mdb files ([ad17ae3](https://github.com/andipaetzold/mdb-reader/commit/ad17ae3c62e94e2ada69d00a439c38d9e488836c)), closes [#90](https://github.com/andipaetzold/mdb-reader/issues/90)

## [1.0.10](https://github.com/andipaetzold/mdb-reader/compare/v1.0.9...v1.0.10) (2021-12-05)


### Bug Fixes

* export `Value` type ([61d1b02](https://github.com/andipaetzold/mdb-reader/commit/61d1b028acf8c131889ddb40cdb6185dcd374c93))

## [1.0.9](https://github.com/andipaetzold/mdb-reader/compare/v1.0.8...v1.0.9) (2021-11-16)


### Bug Fixes

* incorrect boolean values in tables with inserted columns ([#124](https://github.com/andipaetzold/mdb-reader/issues/124)) ([0d4b78c](https://github.com/andipaetzold/mdb-reader/commit/0d4b78cc14b26ea0fcfbbe6768dae5ed3a418936))

## [1.0.8](https://github.com/andipaetzold/mdb-reader/compare/v1.0.7...v1.0.8) (2021-11-05)


### Bug Fixes

* round milliseconds in datetime parser ([#123](https://github.com/andipaetzold/mdb-reader/issues/123)) ([b1b4379](https://github.com/andipaetzold/mdb-reader/commit/b1b4379b830041c6a725b67d165d0811e98d8a67))

## [1.0.7](https://github.com/andipaetzold/mdb-reader/compare/v1.0.6...v1.0.7) (2021-10-22)


### Bug Fixes

* mixed endianness of guids ([#118](https://github.com/andipaetzold/mdb-reader/issues/118)) ([ac7790c](https://github.com/andipaetzold/mdb-reader/commit/ac7790c3888156f68a8503b94f647ad447d4fef2))

## [1.0.6](https://github.com/andipaetzold/mdb-reader/compare/v1.0.5...v1.0.6) (2021-10-11)


### Bug Fixes

* handle tables with over 256 cols (incl. deleted) ([#111](https://github.com/andipaetzold/mdb-reader/issues/111)) ([e5f0d19](https://github.com/andipaetzold/mdb-reader/commit/e5f0d1911df6917a86fe0daa5047a8284ba9fe4a))

## [1.0.5](https://github.com/andipaetzold/mdb-reader/compare/v1.0.4...v1.0.5) (2021-10-11)


### Bug Fixes

* don't throw for BigInt and Date/Time Extended ([e02ef3a](https://github.com/andipaetzold/mdb-reader/commit/e02ef3a2f1be14c8333798848fed4118303929bc))

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