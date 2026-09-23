import { vi } from 'vitest';

// jsdom does not implement the APIs the site's hooks use. Stub them so tests can
// mount components without touching the real browser behaviour.
if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
}

class MockObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
}

if (!('IntersectionObserver' in window)) {
    Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        value: MockObserver,
    });
}

if (!('ResizeObserver' in window)) {
    Object.defineProperty(window, 'ResizeObserver', {
        writable: true,
        value: MockObserver,
    });
}
