import { SAMPLES } from '../../content/samples';

export interface SamplePickerProps {
    value: string;
    onChange(id: string): void;
}

/** Row of preset SVGs so visitors can try very different markup quickly. */
export function SamplePicker({ value, onChange }: SamplePickerProps) {
    return (
        <div className="sample-picker" role="group" aria-label="Sample SVG">
            {SAMPLES.map((sample) => (
                <button
                    key={sample.id}
                    type="button"
                    aria-pressed={sample.id === value}
                    onClick={() => onChange(sample.id)}
                >
                    {sample.title}
                </button>
            ))}
        </div>
    );
}
