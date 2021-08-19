export abstract class CodecHandler {
    /**
     * Returns {@code true} if this handler can decode a page inline,
     * {@code false} otherwise.  If this method returns {@code false}, the
     * {@link #decodePage} method will always be called with separate buffers.
     */
    public abstract canDecodeInline(): boolean;

    /**
     * Decodes the given page buffer.
     *
     * @param inPage the page to be decoded
     * @param outPage the decoded page.  if {@link #canDecodeInline} is {@code
     *                true}, this will be the same buffer as inPage.
     * @param pageNumber the page number of the given page
     *
     * @throws IOException if an exception occurs during decoding
     */
    public abstract decodePage(page: Buffer, pageNumber: number): Buffer;
}
