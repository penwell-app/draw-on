export interface PropRow {
    name: string;
    type: string;
    default?: string;
    required?: boolean;
    description: string;
}

export interface PropTableProps {
    rows: PropRow[];
    /** Column headers; swap them for methods, returned values, etc. */
    columns?: [string, string, string, string];
    caption?: string;
}

/** Reference table with mono types and defaults, used across the API pages. */
export function PropTable({
    rows,
    columns = ['Name', 'Type', 'Default', 'Description'],
    caption,
}: PropTableProps) {
    return (
        <div className="prop-table">
            <table>
                {caption && <caption className="visually-hidden">{caption}</caption>}
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column} scope="col">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.name}>
                            <td>
                                <span className="prop-name">{row.name}</span>
                                {row.required && <span className="prop-required">required</span>}
                            </td>
                            <td className="prop-type">{row.type}</td>
                            <td className="prop-default">{row.default ?? '—'}</td>
                            <td>{row.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
