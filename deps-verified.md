# Dependencies Verified

Safe npm dependency updates were applied on 2026-06-20 with `npm audit fix`
and `npm update`.

Verified commands:

- `npm run lint`
- `npm run build`

Notes:

- `npm audit --audit-level=low` still reports a nested Next/PostCSS advisory.
  npm's available fix path is `npm audit fix --force`, which would install
  `next@9.3.3` as a breaking downgrade, so it is deferred.
- `npm outdated` only reports `@types/node` 26.0.0 as a major update beyond the
  current wanted 25.9.4 range.
