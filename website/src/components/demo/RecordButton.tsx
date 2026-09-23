export interface RecordButtonProps {
    canRecord: boolean;
    recording: boolean;
    progress?: number;
    onRecord(): void;
    label?: string;
    disabled?: boolean;
}

/**
 * Export button. Recording needs `MediaRecorder` plus `canvas.captureStream()`,
 * so it stays disabled with an explanation when the engine cannot do it.
 */
export function RecordButton({
    canRecord,
    recording,
    progress = 0,
    onRecord,
    label = 'Record WebM',
    disabled,
}: RecordButtonProps) {
    const text = recording ? `Recording ${Math.round(progress * 100)}%` : label;

    return (
        <button
            type="button"
            className="button small secondary"
            onClick={onRecord}
            disabled={!canRecord || recording || disabled}
            title={
                canRecord
                    ? 'Render every frame to a WebM file, in this tab.'
                    : 'This browser cannot capture a canvas stream. Try a Chromium-based browser.'
            }
        >
            {text}
        </button>
    );
}
