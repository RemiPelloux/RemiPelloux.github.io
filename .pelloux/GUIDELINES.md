# Pelloux Guidelines

Coding discipline for humans and AI agents working in the same codebase. Ten rules, a few hard
numbers, and a machine that checks them before every commit.

Language profiles in `languages/` add stack-specific limits, idioms and linter settings. When a
profile gives a different number for its language, the profile wins. Everything else here applies
to every language.

---

## 1. Finish the work

Execute the task from A to Z. A plan, a partial change or a list of steps for the user is not done.

- If you can run the command, edit the file, wire the config or run the test, do it yourself.
- No hand-off closers such as "you can now…" or "next, run…" when the step is part of the task
  and you have the access to do it.
- Done means the requested outcome works and is verified: tests, type check and build pass for
  what you touched.
- Stop early only when truly blocked: a missing secret, a destructive action that needs approval,
  or a product choice only a human can make. Then say what blocked you, what you finished, and the
  single smallest input you need.

## 2. Think before coding

- State your assumptions. If you are unsure, ask.
- When a request has several readings, list them. Do not pick one silently.
- If a simpler approach exists, say so and push back when it is warranted.
- If something is unclear, stop and ask before writing code.

## 3. Pick the simplest fix

For any non-trivial change, name at least three approaches before you write code (one line each):

1. **Fix at the failure point:** widen a validation, change one config line, correct the wrong
   assumption.
2. **Work around it elsewhere:** a caller-side transform, an extra flag, an adapter.
3. **Add a new pipeline or abstraction:** a new module, service or shared helper.

Default to (1). If you choose (2) or (3), write one sentence on why (1) cannot solve it. Do not add
client-side complexity when a server allowlist or a config change is enough.

## 4. Keep it small

- The minimum code that solves the problem. Nothing speculative.
- No abstraction for code used once.
- No flexibility, option or configuration nobody asked for.
- No error handling for cases that cannot happen.
- Prefer the standard library. Every new dependency must earn its place: write down why.
- 200 lines that could be 50? Rewrite them.

## 5. Change only what was asked

- Touch only what the task requires. Every changed line must trace back to the request.
- Do not "improve" nearby code, comments or formatting.
- Match the patterns already in the codebase, even if you would write it differently.
- Never run a formatter on the whole tree as a side effect. Format the files you changed.
- Dead code that was already there: mention it, leave it. Code your change made unused: remove it.

## 6. Prove it

Turn the task into steps you can check before you edit:

```
1. <step> → verify: <check>
2. <step> → verify: <check>
```

- Bug fix: reproduce it first with a failing test or command, then show it passing.
- Behavior change: a test for the happy path and one for the failure path.
- **Never mock the feature you ship.** Mock the network, the clock and third parties, not the code
  under test. A test that passes with the feature deleted proves nothing.
- Never skip, disable or loosen a failing test to get green. Fix the code or report the failure.

## 7. Stay inside the limits

| Scope | Target | Hard limit |
|---|---|---|
| Source file | ≤ 300 lines | 400 lines |
| Entry module: controller, route handler, hook, service | ≤ 200 lines | 200 lines |
| Function or method | ≤ 25 lines | 25 lines |
| Parameters | ≤ 3 | 3 (4 in PHP, Python, Go, Rust, C and C++) |
| Nesting depth | ≤ 3 | 3 |
| Relative import | ≤ 2 levels up (`../../`) | 2 levels |

- Function length counts non-blank, non-comment lines from the signature to the closing line.
- Parameters exclude the receiver (`self`, `this`, `&self`). Beyond the limit, pass an options
  object, a struct, a dataclass or a request object.
- Constructors that inject dependencies are exempt from the parameter limit. A long list there
  means the class does too much, which the file limit will catch.
- No magic numbers: use named constants or config.
- Prefer early returns over nested conditions.
- No deep relative imports. `../../../lib/x` breaks when either file moves and hides where the
  code lives. Import from the project root: a path alias (`@/`), an absolute package import,
  `package:`, `crate::` or the include path.
- The audit allows a 10 % tolerance before it fails (440 lines for a file, 220 for an entry
  module, 27 for a function). The tolerance is for the machine. The limit is the target you write
  to.

**Exempt:** tests, migrations, seeders, locale bundles, generated code, vendored code and static
data. Legacy files over the limit go in `pelloux-baseline.json` (see rule 10).

## 8. Leave no debug behind

- No debug output in a commit: `console.log`, `print`, `dd`, `dump`, `var_dump`, `dbg!`,
  `breakpoint()`, `debugger`. Each profile lists the tokens for its language.
- No commented-out code. Git remembers it.
- No focused tests (`it.only`, `describe.only`) and no merge conflict markers.
- No `as any`, `@ts-ignore`, `# type: ignore` or `@SuppressWarnings` to silence a real error.
- No secrets in files. Use a git-ignored `.env` and keep `.env.example` current.
- Remove the imports, functions and variables your change made unused.

## 9. Commit like a teammate

- Conventional Commits: `<type>(<scope>): <imperative subject ≤ 72 chars>`. Types: `feat`, `fix`,
  `docs`, `test`, `refactor`, `perf`, `build`, `chore`.
- One logical change per commit.
- Stage by explicit path. Never `git add -A` or `git add .`: another agent or person may share the
  working tree.
- Preserve concurrent work. Merge, never overwrite. Never force-push a shared branch.
- Never bypass a failing hook with `--no-verify` on a commit that will be deployed.
- Never push to a production branch unless the repository says that is the workflow.
- Parallel agents work in separate git worktrees, one task each.

## 10. Let the machine check

Rules that nobody checks drift. Each repository wires the limits into three places:

| Layer | Check |
|---|---|
| Agent loop | The Claude Code hook warns the agent the moment a file it edits breaks a hard limit |
| Pre-commit | `pelloux audit --staged` on the files being committed |
| CI | `pelloux audit` on the whole tree, plus the native linters from the language profile |

Legacy code is never a reason to stop. `pelloux seed` records every current violation in
`pelloux-baseline.json`. From then on the ratchet holds: a listed file or function may shrink,
never grow, and nothing new may join the list. Re-seed only on purpose, in its own commit.

---

## TypeScript and JavaScript

Profile for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` and `.cjs`. Applies on top of the core guidelines.

### Limits

| Scope | Target | Hard limit |
|---|---|---|
| File, component, page | ≤ 300 lines | 400 |
| Hook (`hooks/`), service (`services/`), route handler (`routes/`, `api/`) | ≤ 200 lines | 200 |
| Function, component body, callback | ≤ 25 lines | 25 |
| Parameters | ≤ 3 | 3, then one typed options object |

A React component is a function: its body counts against the 25 lines. Split by extracting child
components and hooks, not by moving JSX into helper functions in the same file.

### Idioms that keep code inside the limits

- One options object instead of a fourth parameter: `createUser({ email, role, invitedBy })`.
- `type Props` next to the component, destructured in the signature.
- Data fetching lives in a hook or a query function, never inline in a component.
- One HTTP client for the whole app. No raw `fetch` or `axios` calls scattered in components.
- Narrow with type guards and `satisfies`, not with casts.
- Early `return` for loading, empty and error states before the main JSX.
- Every user-visible string goes through the i18n layer. No ternaries on the locale.
- Imports start at the project root through a `@/` alias (`paths` in `tsconfig.json`, `resolve.alias` in Vite). Two `../` at most.

### Never commit

`console.log`, `console.debug`, `debugger`, `it.only`, `describe.only`, `test.only`, `as any`,
`@ts-ignore`, `@ts-expect-error` used to silence a real error, `// eslint-disable` without a reason
on the same line.

### Enforce it with your own tools

`eslint.config.js`, with `typescript-eslint` loaded:

```js
export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["**/*.test.*", "**/*.spec.*", "**/locales/**", "**/*.d.ts", "dist/**"],
    rules: {
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 25, skipBlankLines: true, skipComments: true }],
      "max-params": ["error", 3],
      "max-depth": ["error", 3],
      "no-magic-numbers": ["warn", { ignore: [-1, 0, 1, 2], ignoreArrayIndexes: true }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-restricted-imports": ["error", { patterns: [{ group: ["../../../*"], message: "Import from @/ instead" }] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },
];
```

On a legacy codebase, start these at `warn` and use ESLint bulk suppressions
(`eslint --suppress-all`, then `--prune-suppressions` as files shrink) so the count only goes down.

### Verify before commit

```sh
npx tsc --noEmit
npx eslint --max-warnings 0 $(git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx')
npx vitest run --changed     # or: npx jest --onlyChanged
python3 .pelloux/pelloux.py audit --staged
```

### Exempt

`*.test.*`, `*.spec.*`, `__tests__/`, `*.d.ts`, `locales/`, `i18n/`, generated clients, `dist/`,
`build/`, `.next/`, `node_modules/`.
