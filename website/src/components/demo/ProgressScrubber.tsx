export interface ProgressScrubberProps {
    value: number;
    onChange(fraction: number): void;
    label?: string;
    disabled?: boolean;
}

/** Range input wired to `drawing.setProgress(0..1)`. */
export function ProgressScrubber({
    value,
    onChange,
    label = 'Animation progress',
    disabled,
}: ProgressScrubberProps) {
    return (
        <>
            <input
                className="demo-scrub"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={value}
                disabled={disabled}
                aria-label={label}
                onChange={(event) => onChange(Number(event.target.value))}
            />
            <span className="demo-percent">{Math.round(value * 100)}%</span>
        </>
    );
}
