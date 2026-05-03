# Changelog

All notable changes to the PMM Sherpa skill ship here. Versions follow
semver-ish: MAJOR for breaking changes to tool routing or activation, MINOR
for new sections or conventions, PATCH for copy edits.

## [0.1.0] — 2026-05-02

### Added

- Initial public skill draft.
- `SKILL.md` with activation keywords, three-tool routing decision tree
  (`ask_sherpa`, `draft_artifact`, `get_feedback`), and the three
  orchestration rules: extract before consulting, respect local context,
  frameworks over defaults.
- `pmm-context.md` convention for project-local ground truth, with a
  drop-in `pmm-context.template.md`.
- `README.md` install instructions for Claude Code, Claude Desktop /
  Claude.ai Projects, and ChatGPT Custom GPTs.
- Out-of-scope guardrails for legal, financial, live-web, and
  code-generation requests.
- Graceful degradation when the connector is not installed — points users
  to https://pmmsherpa.com/connect.
