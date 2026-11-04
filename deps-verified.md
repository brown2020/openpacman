# Dependencies verified

Checked 4 Nov 2026 on Node.js 24.

- Direct dependencies are at the latest npm release, except TypeScript and `@types/node`.
- Installed: Next.js 16.4.5, React 19.3.1, Zustand 5.0.16, Tailwind CSS 4.3.4, ESLint 10.14.0, TypeScript 6.0.3, `@types/node` 24.19.2.
- TypeScript stays on 6.0.3 because TypeScript 7.0 has no compiler API. Registry `latest` is 7.0.2. See `roadmap.md`.
- `@types/node` stays on 24.19.2 to match the Node.js 24 runtime. Registry `latest` is 26.6.6.
- `overrides` pins `minimatch` to 11.0.4 for `eslint`, `@eslint/config-array`, and `@typescript-eslint/typescript-estree`. There is no `jwks-rsa` or `jose` pin.
- `npm audit` reports 5 moderate vulnerabilities, all `minimatch@3.1.5` nested under `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react`. Those copies stay on v3 because the plugins call the default export as a function. Do not run `npm audit fix --force`.
- `firebase-admin` and `jwks-rsa` are not dependencies.
