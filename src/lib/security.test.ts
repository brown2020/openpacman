import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { getSecurityHeaders } from "./security-headers";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "../..");

describe("security headers", () => {
  it("sets nosniff and frame-ancestors, and skips eval in production", () => {
    const headers = getSecurityHeaders("production");
    const csp = headers.find((header) => header.key === "Content-Security-Policy")?.value ?? "";
    assert.match(csp, /frame-ancestors 'none'/);
    assert.equal(csp.includes("unsafe-eval"), false);
    assert.equal(csp.includes("fonts.googleapis.com"), false);
    assert.equal(
      headers.find((header) => header.key === "X-Content-Type-Options")?.value,
      "nosniff"
    );
  });

  it("is wired from the Next config", () => {
    const config = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");
    assert.match(config, /getSecurityHeaders/);
  });
});

describe("self-hosted fonts and pinned CI", () => {
  it("does not load stylesheets from Google Fonts", () => {
    const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
    assert.equal(css.includes("fonts.googleapis.com"), false);
    assert.equal(css.includes("fonts.gstatic.com"), false);
  });

  it("pins GitHub Actions to commit SHAs", () => {
    const ci = fs.readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8");
    assert.match(ci, /actions\/checkout@[0-9a-f]{40}/);
    assert.match(ci, /actions\/setup-node@[0-9a-f]{40}/);
    assert.equal(ci.includes("actions/checkout@v4"), false);
    assert.equal(ci.includes("actions/setup-node@v4"), false);
  });
});
