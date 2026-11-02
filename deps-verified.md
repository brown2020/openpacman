# Dependencies verified

Checked 2 Nov 2026 on Node.js 24.

- Direct dependencies are at the latest npm release, except TypeScript.
- Installed: Next.js 16.4.3, React 19.3.1, Zustand 5.0.16, Tailwind CSS 4.3.3, ESLint 10.14.0, TypeScript 6.0.3, `@types/node` 26.6.6.
- TypeScript 7.0.2 is the registry `latest`. `tsc` 7.0.2 typechecks this repo. `eslint-config-next` loads `typescript-eslint` 8.72.1, which rejects TypeScript 7.0 before lint starts (`typescript >=4.8.4 <6.1.0`). See `roadmap.md`.
- `overrides` pins `minimatch` to 11.0.4 for `eslint`, `@eslint/config-array`, and `@typescript-eslint/typescript-estree`.
- `npm audit` reports 5 moderate vulnerabilities, all `minimatch@3.1.5` nested under `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react`. Those copies stay on v3 because the plugins call the default export as a function. Do not run `npm audit fix --force`.
- `firebase-admin` and `jwks-rsa` are not dependencies.
