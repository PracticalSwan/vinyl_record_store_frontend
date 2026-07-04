import { useState } from 'react';
import {
  CONDITIONS,
  FORMATS,
  GENRES,
  emptyPreferences,
  normalizePreferences,
  toPreferenceRequest,
} from '../../lib/preferences';

function toggle(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function CheckboxGroup({ legend, name, options, values, onChange, error }) {
  return (
    <fieldset className="preference-group" aria-describedby={error ? `${name}-error` : undefined}>
      <legend>{legend}</legend>
      <div className="preference-options">
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={values.includes(option)}
              onChange={() => onChange(toggle(values, option))}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error && <p className="field-error" id={`${name}-error`}>{error}</p>}
    </fieldset>
  );
}

function GenreStep({ form, update, errors }) {
  return (
    <>
      <CheckboxGroup legend="Favorite genres (choose one to five)" name="favorite-genres" options={GENRES} values={form.favoriteGenres} onChange={(value) => update('favoriteGenres', value)} error={errors.favoriteGenres} />
      <CheckboxGroup legend="Genres you would rather avoid (optional)" name="disliked-genres" options={GENRES} values={form.dislikedGenres} onChange={(value) => update('dislikedGenres', value)} error={errors.dislikedGenres} />
    </>
  );
}

function DetailStep({ form, update, errors, artistDraft, setArtistDraft }) {
  return (
    <>
      <label className="preference-field" htmlFor="favorite-artists">
        Favorite artists (optional, comma-separated)
        <input id="favorite-artists" value={artistDraft} onChange={(event) => {
          setArtistDraft(event.target.value);
          update('favoriteArtists', event.target.value.split(',').map((value) => value.trim()).filter(Boolean));
        }} />
      </label>
      {errors.favoriteArtists && <p className="field-error">{errors.favoriteArtists}</p>}
      <fieldset className="preference-group">
        <legend>Budget per record (optional)</legend>
        <div className="budget-fields">
          <label htmlFor="budget-min">Minimum<input id="budget-min" type="number" min="0" step="0.01" value={form.budget.min} onChange={(event) => update('budget', { ...form.budget, min: event.target.value })} /></label>
          <label htmlFor="budget-max">Maximum<input id="budget-max" type="number" min="0" step="0.01" value={form.budget.max} onChange={(event) => update('budget', { ...form.budget, max: event.target.value })} /></label>
        </div>
        {errors.budget && <p className="field-error">{errors.budget}</p>}
      </fieldset>
      <CheckboxGroup legend="Preferred condition" name="conditions" options={CONDITIONS} values={form.conditions} onChange={(value) => update('conditions', value)} error={errors.conditions} />
      <CheckboxGroup legend="Preferred format" name="formats" options={FORMATS} values={form.formats} onChange={(value) => update('formats', value)} error={errors.formats} />
    </>
  );
}

function Review({ form }) {
  const rows = [
    ['Favorite genres', form.favoriteGenres.join(', ') || 'None selected'],
    ['Avoid', form.dislikedGenres.join(', ') || 'None'],
    ['Favorite artists', form.favoriteArtists.join(', ') || 'None'],
    ['Budget', form.budget.min || form.budget.max ? `${form.budget.min || '0'} to ${form.budget.max || 'no maximum'}` : 'No preference'],
    ['Condition', form.conditions.join(', ') || 'No preference'],
    ['Format', form.formats.join(', ') || 'No preference'],
  ];
  return <dl className="preference-review">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export default function PreferencesForm({ initial, onSave, onSkip, onClear, wizard = false, submitting = false, requestError = null }) {
  const [form, setForm] = useState(() => normalizePreferences(initial));
  const [artistDraft, setArtistDraft] = useState(() => normalizePreferences(initial).favoriteArtists.join(', '));
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const result = toPreferenceRequest(form, { completed: true });
    setErrors(result.errors);
    return result;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (wizard && step < 3) {
      const result = validate();
      if (step === 1 && (result.errors.favoriteGenres || result.errors.dislikedGenres)) return;
      if (step === 2 && !result.valid) return;
      setStep((value) => value + 1);
      return;
    }
    const result = validate();
    if (result.valid) await onSave(result.request);
  };

  return (
    <form className="preferences-form" onSubmit={submit} noValidate>
      {wizard && <p className="preference-progress" aria-live="polite">Step {step} of 3</p>}
      {(!wizard || step === 1) && <GenreStep form={form} update={update} errors={errors} />}
      {(!wizard || step === 2) && <DetailStep form={form} update={update} errors={errors} artistDraft={artistDraft} setArtistDraft={setArtistDraft} />}
      {wizard && step === 3 && <Review form={form} />}
      {requestError && <p className="form-error" role="alert">{requestError.message}</p>}
      <div className="preference-actions">
        {wizard && step > 1 && <button className="btn btn-outline" type="button" onClick={() => setStep((value) => value - 1)}>Back</button>}
        {wizard && onSkip && <button className="btn btn-ghost" type="button" onClick={onSkip}>Skip for now</button>}
        {!wizard && onClear && <button className="btn btn-ghost" type="button" onClick={() => { setForm(emptyPreferences()); setArtistDraft(''); setErrors({}); onClear(); }}>Clear preferences</button>}
        <button className="btn btn-accent" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : wizard && step < 3 ? 'Continue' : 'Save preferences'}
        </button>
      </div>
    </form>
  );
}
