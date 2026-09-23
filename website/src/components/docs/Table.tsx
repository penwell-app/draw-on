import type { ComponentPropsWithoutRef } from 'react';

/** Tables scroll horizontally on narrow screens instead of breaking the layout. */
export function Table(props: ComponentPropsWithoutRef<'table'>) {
    return (
        <div className="table-scroll">
            <table {...props} />
        </div>
    );
}
