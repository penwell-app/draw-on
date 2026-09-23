export interface ApiSignatureProps {
    /** The TypeScript signature, exactly as it appears in the source. */
    signature: string;
    /** What it returns, in words. */
    returns?: string;
    /** Which entry point it is exported from. */
    entry?: string;
    /** Optionally note a version or caveat. */
    note?: string;
}

/** The dashed signature card at the top of every reference page. */
export function ApiSignature({ signature, returns, entry, note }: ApiSignatureProps) {
    return (
        <div className="api-signature">
            <pre className="api-signature-code">
                <code>{signature}</code>
            </pre>
            <div className="api-meta">
                {entry && <span className="chip accent">{entry}</span>}
                {returns && <span className="chip">returns {returns}</span>}
                {note && <span className="chip">{note}</span>}
            </div>
        </div>
    );
}
