import { Link } from 'react-router-dom';
import type { AnchorHTMLAttributes } from 'react';

/** Internal routes go through the router; everything else is a plain anchor. */
export function SmartLink({ href = '', ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    if (/^https?:/.test(href) || href.startsWith('#') || href.startsWith('mailto:')) {
        return (
            <a
                href={href}
                {...rest}
                {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
            />
        );
    }

    return <Link to={href} {...rest} />;
}
