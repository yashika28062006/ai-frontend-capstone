// Pure helpers for SettingsForm. Kept dependency-free (no React) so the
// important validation and save-state logic can be unit tested directly
// with Node's built-in test runner, without a DOM or component renderer.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function createEmptyValues() {
  return {
    name: '',
    email: '',
    emailNotifications: true,
    pushNotifications: false,
    theme: 'system',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

export function createInitialState() {
  const values = createEmptyValues()
  return {
    values,
    savedValues: values,
    errors: {},
    status: 'idle', // 'idle' | 'saving' | 'saved' | 'error'
  }
}

/**
 * Validates form values. Password fields are only checked once the user
 * has started entering a new password — an untouched password section
 * never blocks saving profile/notification/appearance changes.
 */
export function validateSettingsForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Enter your name.'
  }

  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.newPassword.length > 0) {
    if (!values.currentPassword) {
      errors.currentPassword = 'Enter your current password.'
    }
    if (values.newPassword.length < 8) {
      errors.newPassword = 'Use at least 8 characters.'
    }
    if (values.confirmPassword !== values.newPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }
  }

  return errors
}

export function hasUnsavedChanges(values, savedValues) {
  const keys = Object.keys(createEmptyValues())
  return keys.some((key) => values[key] !== savedValues[key])
}

/**
 * Builds the payload handed to onSave. Password fields are only included
 * when the user actually entered a new password, so a stray value left in
 * "confirm password" is never sent by itself.
 */
export function buildSavePayload(values) {
  const { currentPassword, newPassword, confirmPassword, ...rest } = values
  if (!newPassword) {
    return rest
  }
  return { ...rest, currentPassword, newPassword, confirmPassword }
}

export function settingsFormReducer(state, action) {
  switch (action.type) {
    case 'CHANGE': {
      const { field, value } = action
      const nextErrors = { ...state.errors }
      delete nextErrors[field]
      delete nextErrors.form
      return {
        ...state,
        values: { ...state.values, [field]: value },
        errors: nextErrors,
        status: state.status === 'saved' || state.status === 'error' ? 'idle' : state.status,
      }
    }
    case 'VALIDATION_FAILED':
      return { ...state, errors: action.errors }
    case 'SUBMIT_START':
      return { ...state, status: 'saving', errors: {} }
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        status: 'saved',
        values: action.savedValues,
        savedValues: action.savedValues,
        errors: {},
      }
    case 'SUBMIT_ERROR':
      return { ...state, status: 'error', errors: { form: action.message } }
    case 'RESET':
      return { ...state, values: state.savedValues, errors: {}, status: 'idle' }
    default:
      return state
  }
}
