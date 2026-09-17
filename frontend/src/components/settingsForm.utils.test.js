import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createEmptyValues,
  createInitialState,
  validateSettingsForm,
  hasUnsavedChanges,
  buildSavePayload,
  settingsFormReducer,
} from './settingsForm.utils.js'

test('validateSettingsForm requires a name', () => {
  const values = { ...createEmptyValues(), email: 'a@example.com' }
  const errors = validateSettingsForm(values)
  assert.equal(errors.name, 'Enter your name.')
})

test('validateSettingsForm rejects a malformed email', () => {
  const values = { ...createEmptyValues(), name: 'Ada', email: 'not-an-email' }
  const errors = validateSettingsForm(values)
  assert.equal(errors.email, 'Enter a valid email address.')
})

test('validateSettingsForm accepts a valid name and email with no password change', () => {
  const values = { ...createEmptyValues(), name: 'Ada', email: 'ada@example.com' }
  const errors = validateSettingsForm(values)
  assert.deepEqual(errors, {})
})

test('validateSettingsForm ignores password fields until newPassword is entered', () => {
  const values = {
    ...createEmptyValues(),
    name: 'Ada',
    email: 'ada@example.com',
    // stray/mismatched confirm value with no newPassword should NOT trigger validation
    confirmPassword: 'whatever',
  }
  const errors = validateSettingsForm(values)
  assert.deepEqual(errors, {})
})

test('validateSettingsForm requires the current password once a new password is entered', () => {
  const values = {
    ...createEmptyValues(),
    name: 'Ada',
    email: 'ada@example.com',
    newPassword: 'longenough',
    confirmPassword: 'longenough',
  }
  const errors = validateSettingsForm(values)
  assert.equal(errors.currentPassword, 'Enter your current password.')
});

test('validateSettingsForm enforces an 8 character minimum on the new password', () => {
  const values = {
    ...createEmptyValues(),
    name: 'Ada',
    email: 'ada@example.com',
    currentPassword: 'oldpass',
    newPassword: 'short',
    confirmPassword: 'short',
  }
  const errors = validateSettingsForm(values)
  assert.equal(errors.newPassword, 'Use at least 8 characters.')
})

test('validateSettingsForm requires the confirmation to match the new password', () => {
  const values = {
    ...createEmptyValues(),
    name: 'Ada',
    email: 'ada@example.com',
    currentPassword: 'oldpass',
    newPassword: 'longenough',
    confirmPassword: 'different',
  }
  const errors = validateSettingsForm(values)
  assert.equal(errors.confirmPassword, 'Passwords do not match.')
})

test('validateSettingsForm passes a fully valid password change', () => {
  const values = {
    ...createEmptyValues(),
    name: 'Ada',
    email: 'ada@example.com',
    currentPassword: 'oldpass',
    newPassword: 'longenough',
    confirmPassword: 'longenough',
  }
  const errors = validateSettingsForm(values)
  assert.deepEqual(errors, {})
})

test('hasUnsavedChanges is false when values match', () => {
  const values = createEmptyValues()
  assert.equal(hasUnsavedChanges(values, { ...values }), false)
})

test('hasUnsavedChanges is true when a field differs', () => {
  const saved = createEmptyValues()
  const values = { ...saved, name: 'Ada' }
  assert.equal(hasUnsavedChanges(values, saved), true)
})

test('buildSavePayload omits password fields when no new password was entered', () => {
  const values = { ...createEmptyValues(), name: 'Ada', email: 'ada@example.com' }
  const payload = buildSavePayload(values)
  assert.equal('currentPassword' in payload, false)
  assert.equal('newPassword' in payload, false)
  assert.equal('confirmPassword' in payload, false)
  assert.equal(payload.name, 'Ada')
})

test('buildSavePayload includes password fields when a new password was entered', () => {
  const values = {
    ...createEmptyValues(),
    name: 'Ada',
    email: 'ada@example.com',
    currentPassword: 'oldpass',
    newPassword: 'longenough',
    confirmPassword: 'longenough',
  }
  const payload = buildSavePayload(values)
  assert.equal(payload.newPassword, 'longenough')
  assert.equal(payload.currentPassword, 'oldpass')
})

test('reducer CHANGE updates a field and clears its error', () => {
  const state = createInitialState()
  state.errors.name = 'Enter your name.'
  const next = settingsFormReducer(state, { type: 'CHANGE', field: 'name', value: 'Ada' })
  assert.equal(next.values.name, 'Ada')
  assert.equal('name' in next.errors, false)
})

test('reducer SUBMIT_START sets status to saving and clears errors', () => {
  const state = { ...createInitialState(), errors: { form: 'oops' } }
  const next = settingsFormReducer(state, { type: 'SUBMIT_START' })
  assert.equal(next.status, 'saving')
  assert.deepEqual(next.errors, {})
})

test('reducer SUBMIT_SUCCESS marks saved and syncs savedValues', () => {
  const state = createInitialState()
  const savedValues = { ...state.values, name: 'Ada' }
  const next = settingsFormReducer(state, { type: 'SUBMIT_SUCCESS', savedValues })
  assert.equal(next.status, 'saved')
  assert.deepEqual(next.savedValues, savedValues)
  assert.deepEqual(next.values, savedValues)
})

test('reducer SUBMIT_ERROR surfaces a form-level error and resets status', () => {
  const state = { ...createInitialState(), status: 'saving' }
  const next = settingsFormReducer(state, { type: 'SUBMIT_ERROR', message: 'Network down' })
  assert.equal(next.status, 'error')
  assert.equal(next.errors.form, 'Network down')
})

test('reducer RESET reverts values to the last saved values', () => {
  const initial = createInitialState()
  const savedValues = { ...initial.values, name: 'Ada' }
  const dirtyState = { ...initial, values: { ...savedValues, name: 'Ada Lovelace' }, savedValues }
  const next = settingsFormReducer(dirtyState, { type: 'RESET' })
  assert.deepEqual(next.values, savedValues)
})
