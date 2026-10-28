# OpenPacman roadmap

Punchlist as of 28 Oct 2026. GitHub has no open issues and no open pull requests.

## Next

1. Move to TypeScript 7.1 or newer once `typescript-eslint` accepts it. TypeScript 7.0.2 is on npm, but ESLint fails immediately: `typescript-eslint does not support TS 7.0`. Tracking note: [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940). The supported side-by-side alias (`typescript` → `@typescript/typescript6`, plus a native `tsc`) was not adopted; it would typecheck the app with two compilers and pin the API package to 6.0.2, behind the 6.0.3 already in use.
2. Add a browser test for the animation loop: start, leave ready, eat a nearby dot, eat a power pellet, and confirm the board position does not change when the POWER MODE badge appears.
3. Give later levels their own maze layouts. All 13 configs reuse `CLASSIC_MAZE`.
4. Tighten Content-Security-Policy script-src. Production still allows `'unsafe-inline'` so the Next client runtime can start.
5. Delete or actually use `gameWon`. Nothing sets it, the victory screen is gone, and the loop still treats it as a hard stop.

## Known limitations

- High scores are the top five entries in `localStorage` on this browser only.
- Web Audio stays silent if `AudioContext.resume()` is rejected. The failure is swallowed.
- Pinky and Inky still use the original arcade up-direction target offset.
- `CLAUDE.md` still says no test framework is configured. Tests use the Node.js test runner.
- `deps-verified.md` is a June 2026 note. Current `npm audit` reports 0 vulnerabilities. Do not follow its old `npm audit fix --force` advice.

## Open issues

None on GitHub.
