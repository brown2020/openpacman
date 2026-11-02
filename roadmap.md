# OpenPacman roadmap

Punchlist as of 2 Nov 2026. GitHub has no open issues and no open pull requests.

## Next

1. Move to TypeScript 7.1 or newer once `typescript-eslint` accepts it. Checked again on 2 Nov 2026: `tsc` from TypeScript 7.0.2 typechecks this repo, then ESLint 10.14.0 fails immediately under `typescript-eslint` 8.72.1 with `typescript-eslint does not support TS 7.0`. The peer range is still `typescript >=4.8.4 <6.1.0`. Tracking note: [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940). The supported side-by-side alias (`typescript` → `@typescript/typescript6@6.0.2`, plus `@typescript/native` aliased to TypeScript 7) was not adopted. It would typecheck with two compilers and pin the API package behind the 6.0.3 already in use.
2. Add a browser test for the animation loop: start, leave ready, eat a nearby dot, eat a power pellet, and confirm the board position does not change when the POWER MODE badge appears.
3. Give later levels their own maze layouts. All 13 configs reuse `CLASSIC_MAZE`.
4. Tighten Content-Security-Policy script-src. Production still allows `'unsafe-inline'` so the Next client runtime can start.
5. Delete or actually use `gameWon`. Nothing sets it, the victory screen is gone, and the loop still treats it as a hard stop.

## Known limitations

- High scores are the top five entries in `localStorage` on this browser only.
- Web Audio stays silent if `AudioContext.resume()` is rejected. The failure is swallowed.
- Pinky and Inky still use the original arcade up-direction target offset.
- `CLAUDE.md` still says no test framework is configured. Tests use the Node.js test runner.
- `npm audit` reports 5 moderate findings, all `minimatch@3.1.5` inside `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react` ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)). ESLint's own `minimatch` is overridden to 11.0.4. Do not run `npm audit fix --force`: npm would install `eslint-config-next@0.2.4`. The v3 copies stay because those plugins call `require("minimatch")` as a function, and minimatch 11 only exports a named `minimatch` function. The advisory's vulnerable `firstPhasePreProcess` path is the v10 rewrite, which these plugins do not use.

## Open issues

None on GitHub.
