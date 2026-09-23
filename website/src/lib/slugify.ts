/** Turn heading text into a URL fragment. Shared by the heading renderer and the
 *  table-of-contents extractor so anchors always match. */
export function slugify(value: string): string {
    const slug = value
        .toLowerCase()
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_~]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return slug || 'section';
}
