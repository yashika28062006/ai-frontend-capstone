# FE-05 AI Workflow Comparison

## Feature

For this workflow drill, I built a reusable React settings form in two rounds. The feature includes profile fields, notification preferences, appearance selection, password-change validation, unsaved-change tracking, and save-state handling.

## Round 1: Vague Prompt

The first round used the intentionally vague prompt:

> “Build a settings form for my frontend capstone project.”

Claude immediately asked for clarification about the application domain and what the settings form should control. I selected the generic option. Claude then produced a `SettingsForm.jsx` artifact and a CSS file.

The round exposed an important AI workflow problem: the generated JSX artifact failed with a module-resolution error for `./SettingsForm.css`, and the JSX implementation could not be retrieved from the artifact. As a result, the committed Round 1 `SettingsForm.jsx` contains **0 lines**, while the CSS file was available. This was an AI mistake that I caught during review instead of assuming the generated output was usable.

The Round 1 branch was committed and pushed as `fe05-round1-vague`.

## Round 2: Structured Prompt

The second round used a detailed prompt containing file paths, functional requirements, accessibility requirements, constraints, edge cases, a review step, tests, and verification commands.

The resulting implementation added:

* `SettingsForm.jsx` — 240 lines
* `SettingsForm.css`
* `settingsForm.utils.js`
* `settingsForm.utils.test.js`
* An updated `App.jsx`

Git comparison shows **751 insertions and 117 deletions** between the two branches. The Round 2 implementation also contains **17 automated tests** covering validation, password behavior, dirty state, payload construction, reducer state changes, saving, errors, and reset behavior.

Verification was stronger than Round 1: all **17/17 tests passed**, ESLint passed with no errors, and the Vite production build completed successfully.

## Comparison

The structured workflow required more precise review of requirements but produced a substantially more complete and verifiable result. The vague workflow required clarification and manual recovery after the AI artifact failed. The Round 2 prompt also explicitly required testing and verification, which resulted in concrete evidence rather than relying only on visual inspection.

Exact time spent on each round was not recorded, so this comparison does not claim a time-based winner.

## Lessons

Specific file references, explicit constraints, accessibility requirements, edge cases, and verification instructions made the AI output easier to review. The workflow also demonstrated why generated code should always be tested and inspected rather than accepted automatically.

