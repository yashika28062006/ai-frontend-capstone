import { useReducer } from 'react'
import './SettingsForm.css'
import {
  createInitialState,
  settingsFormReducer,
  validateSettingsForm,
  hasUnsavedChanges,
  buildSavePayload,
} from './settingsForm.utils'

export default function SettingsForm({ onSave }) {
  const [state, dispatch] = useReducer(settingsFormReducer, undefined, createInitialState)
  const { values, savedValues, errors, status } = state
  const isDirty = hasUnsavedChanges(values, savedValues)

  function handleChange(field, value) {
    dispatch({ type: 'CHANGE', field, value })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateSettingsForm(values)
    if (Object.keys(validationErrors).length > 0) {
      dispatch({ type: 'VALIDATION_FAILED', errors: validationErrors })
      return
    }

    dispatch({ type: 'SUBMIT_START' })

    try {
      if (onSave) {
        await onSave(buildSavePayload(values))
      }
      dispatch({
        type: 'SUBMIT_SUCCESS',
        savedValues: { ...values, currentPassword: '', newPassword: '', confirmPassword: '' },
      })
    } catch (err) {
      dispatch({
        type: 'SUBMIT_ERROR',
        message: err instanceof Error ? err.message : "Couldn't save your changes. Try again.",
      })
    }
  }

  function handleReset() {
    dispatch({ type: 'RESET' })
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit} noValidate>
      <header className="settings-form__intro">
        <h1>Settings</h1>
        <p>Manage your profile, notifications, and security.</p>
      </header>

      <fieldset className="settings-form__section">
        <legend>Profile</legend>

        <div className="settings-form__field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p className="settings-form__error" id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="settings-form__field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p className="settings-form__error" id="email-error">
              {errors.email}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="settings-form__section">
        <legend>Notifications</legend>

        <label className="settings-form__toggle-row" htmlFor="emailNotifications">
          <span className="settings-form__toggle-title">Email notifications</span>
          <input
            id="emailNotifications"
            type="checkbox"
            checked={values.emailNotifications}
            onChange={(e) => handleChange('emailNotifications', e.target.checked)}
          />
        </label>

        <label className="settings-form__toggle-row" htmlFor="pushNotifications">
          <span className="settings-form__toggle-title">Push notifications</span>
          <input
            id="pushNotifications"
            type="checkbox"
            checked={values.pushNotifications}
            onChange={(e) => handleChange('pushNotifications', e.target.checked)}
          />
        </label>
      </fieldset>

      <fieldset className="settings-form__section">
        <legend>Appearance</legend>

        <div className="settings-form__radio-group">
          {[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'Match system' },
          ].map((option) => (
            <label key={option.value} className="settings-form__radio-row">
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={values.theme === option.value}
                onChange={() => handleChange('theme', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="settings-form__section">
        <legend>Password</legend>
        <p className="settings-form__hint">Leave blank to keep your current password.</p>

        <div className="settings-form__field">
          <label htmlFor="currentPassword">Current password</label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            aria-invalid={Boolean(errors.currentPassword)}
            aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
          />
          {errors.currentPassword && (
            <p className="settings-form__error" id="currentPassword-error">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div className="settings-form__field-row">
          <div className="settings-form__field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={values.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
            />
            {errors.newPassword && (
              <p className="settings-form__error" id="newPassword-error">
                {errors.newPassword}
              </p>
            )}
          </div>

          <div className="settings-form__field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            {errors.confirmPassword && (
              <p className="settings-form__error" id="confirmPassword-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {errors.form && (
        <p className="settings-form__error settings-form__error--form" role="alert">
          {errors.form}
        </p>
      )}

      <div className="settings-form__actions">
        <span className="settings-form__status" role="status">
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && 'Saved.'}
          {status === 'idle' && isDirty && 'Unsaved changes.'}
        </span>
        <div className="settings-form__buttons">
          <button
            type="button"
            className="settings-form__button settings-form__button--ghost"
            onClick={handleReset}
            disabled={!isDirty || status === 'saving'}
          >
            Discard
          </button>
          <button
            type="submit"
            className="settings-form__button settings-form__button--primary"
            disabled={!isDirty || status === 'saving'}
          >
            Save changes
          </button>
        </div>
      </div>
    </form>
  )
}
