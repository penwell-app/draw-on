import { MEDIA_ITEMS } from '../../content/media';
import type { MediaItem } from '../../content/media';

export interface MediaGalleryProps {
    items?: MediaItem[];
}

export function MediaGallery({ items = MEDIA_ITEMS }: MediaGalleryProps) {
    return (
        <div className="media-grid">
            {items.map((item) => (
                <figure className="media-item" key={item.src}>
                    {item.kind === 'video' ? (
                        <video src={item.src} controls muted loop playsInline preload="metadata" />
                    ) : (
                        <img src={item.src} alt={item.caption} loading="lazy" decoding="async" />
                    )}
                    <figcaption>{item.caption}</figcaption>
                </figure>
            ))}
        </div>
    );
}
