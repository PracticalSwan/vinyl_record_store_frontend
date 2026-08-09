import { forwardRef } from 'react';

const FeedbackControls = forwardRef(function FeedbackControls({
  status = 'idle',
  pending = false,
  onCreate,
  onUndo,
  error = null,
  undoRef,
}, ref) {
  if (status === 'confirmed') {
    return (
      <div className="feedback-status" role="status" aria-live="polite">
        <span>Removed from recommendations.</span>
        <button ref={undoRef || ref} className="btn btn-secondary btn-sm" type="button" onClick={onUndo} disabled={pending}>
          Undo
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    );
  }
  return (
    <div className="feedback-controls" aria-label="Recommendation feedback">
      <button ref={ref} className="btn btn-secondary btn-sm" type="button" onClick={() => onCreate('not-interested')} disabled={pending}>
        Not interested
      </button>
      <button className="btn btn-secondary btn-sm" type="button" onClick={() => onCreate('already-own')} disabled={pending}>
        Already own
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
});

export default FeedbackControls;
