import type { PlaygroundOptions } from '../../lib/codegen';

export interface OptionsPanelProps {
    value: PlaygroundOptions;
    onChange(next: Partial<PlaygroundOptions>): void;
}

const DRAW_TYPES: PlaygroundOptions['type'][] = ['oneByOne', 'delayed', 'sync'];

/**
 * Every control here maps 1:1 to a `DrawingOptions` field — nothing is faked,
 * the live preview is rebuilt from these values.
 */
export function OptionsPanel({ value, onChange }: OptionsPanelProps) {
    return (
        <div className="option-grid">
            <div className="field">
                <label htmlFor="opt-duration">
                    duration
                    <span className="field-value">{value.duration} frames</span>
                </label>
                <input
                    id="opt-duration"
                    type="range"
                    min={40}
                    max={800}
                    step={10}
                    value={value.duration}
                    onChange={(event) => onChange({ duration: Number(event.target.value) })}
                />
                <span className="field-hint">Vivus frames. Higher is slower.</span>
            </div>

            <div className="field">
                <label htmlFor="opt-type">
                    type
                    <span className="field-value">{value.type}</span>
                </label>
                <select
                    id="opt-type"
                    value={value.type}
                    onChange={(event) =>
                        onChange({ type: event.target.value as PlaygroundOptions['type'] })
                    }
                >
                    {DRAW_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                <span className="field-hint">How strokes are sequenced.</span>
            </div>

            <div className="field">
                <label htmlFor="opt-reveal-start">
                    revealStart
                    <span className="field-value">{value.revealStart.toFixed(2)}</span>
                </label>
                <input
                    id="opt-reveal-start"
                    type="range"
                    min={0}
                    max={0.99}
                    step={0.01}
                    value={value.revealStart}
                    onChange={(event) => onChange({ revealStart: Number(event.target.value) })}
                />
                <span className="field-hint">Where fills and labels begin to appear.</span>
            </div>

            <div className="field">
                <label htmlFor="opt-reveal-ms">
                    revealMs
                    <span className="field-value">{value.revealMs} ms</span>
                </label>
                <input
                    id="opt-reveal-ms"
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={value.revealMs}
                    onChange={(event) => onChange({ revealMs: Number(event.target.value) })}
                />
                <span className="field-hint">Fade duration for the reveal step.</span>
            </div>

            <div className="field">
                <label htmlFor="opt-stroke">
                    stroke
                    <span className="field-value">{value.stroke}</span>
                </label>
                <input
                    id="opt-stroke"
                    type="color"
                    value={value.stroke}
                    onChange={(event) => onChange({ stroke: event.target.value })}
                />
                <span className="field-hint">Outline given to fill-only shapes.</span>
            </div>

            <div className="field">
                <label htmlFor="opt-stroke-width">
                    strokeWidth
                    <span className="field-value">{value.strokeWidth}</span>
                </label>
                <input
                    id="opt-stroke-width"
                    type="range"
                    min={0.5}
                    max={6}
                    step={0.25}
                    value={Number(value.strokeWidth)}
                    onChange={(event) => onChange({ strokeWidth: event.target.value })}
                />
                <span className="field-hint">Used when a shape has no stroke width.</span>
            </div>
        </div>
    );
}
