/**
 * @see https://github.com/brianb/mdbtools/blob/d6f5745d949f37db969d5f424e69b54f0da60b9b/HACKING#L64-L70
 */
enum PageType {
    DatabaseDefinitionPage = 0x00,
    DataPage = 0x01,
    TableDefinition = 0x02,
    IntermediateIndexPage = 0x03,
    LeafIndexPages = 0x04,
    PageUsageBitmaps = 0x05,
}

export default PageType;

export function assertPageType(buffer: Buffer, pageType: PageType): void {
    if (buffer[0] !== pageType) {
        throw new Error(`Wrong page type. Expected ${buffer[0]} but received ${pageType}`);
    }
}
