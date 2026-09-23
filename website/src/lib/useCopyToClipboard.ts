import { useCallback, useState } from 'react';

/** Copy text to the clipboard and expose a short-lived "copied" flag. */
export function useCopyToClipboard(resetAfterMs = 1600) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(
        async (text: string) => {
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const area = document.createElement('textarea');
                    area.value = text;
                    area.setAttribute('readonly', '');
                    area.style.position = 'fixed';
                    area.style.opacity = '0';
                    document.body.appendChild(area);
                    area.select();
                    document.execCommand('copy');
                    area.remove();
                }
                setCopied(true);
                window.setTimeout(() => setCopied(false), resetAfterMs);
                return true;
            } catch {
                setCopied(false);
                return false;
            }
        },
        [resetAfterMs],
    );

    return { copied, copy };
}
