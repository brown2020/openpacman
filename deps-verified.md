# Dependencies verified

Checked 28 Oct 2026.

- Direct dependencies are at the latest npm release, except TypeScript.
- Installed: Next.js 16.4.3, React 19.3.1, Zustand 5.0.16, Tailwind CSS 4.3.3, ESLint 10.13.0, TypeScript 6.0.3, `@types/node` 26.6.6.
- TypeScript 7.0.2 is the registry `latest`, and it was not installed. `eslint-config-next` loads `typescript-eslint`, which rejects TypeScript 7.0. See `roadmap.md`.
- `npm audit` reports 0 vulnerabilities.
- `firebase-admin` and `jwks-rsa` are not dependencies. There is no `overrides` entry.
