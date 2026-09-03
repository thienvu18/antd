# React 19 and Ant Design 6 Migration Plan

## Goal

Migrate this fork of `formilyjs/antd` from React 18 and Ant Design 5 to React 19 and Ant Design 6, publish/document it from <https://github.com/thienvu18/antd>, and preserve the existing Formily behavior.

This is a major-version migration. Compatibility claims must match the versions that are actually tested; the first v6 release should not claim React 16/17 or Ant Design 5 support.

## Non-negotiable exit gate

The migration is complete only when all of the following pass from a clean checkout and immutable lockfile:

1. Dependency installation finishes without peer-dependency errors.
2. All workspace packages type-check and compile with React 19, React DOM 19, Ant Design 6, and `@ant-design/icons` 6.
3. The package build and documentation build finish with no errors and no React/Ant Design deprecated-API warnings.
4. Lint contains an enforced deprecated-API check and reports no unsuppressed React/Ant Design deprecations.
5. Every existing test passes, including `packages/components/src/__tests__/dayjs.spec.ts`.
6. New React 19/Ant Design 6 regression and smoke tests pass without `console.error` or `console.warn` output.
7. Packed artifacts can be installed into a clean React 19 consumer fixture, type-checked, built, rendered, and unmounted.
8. `git diff --check` passes and generated artifacts or credentials are not committed.

Warnings from the package manager, compiler, test runner, documentation builder, React, or Ant Design must either be removed at their source or converted into a failing gate. Do not declare success by hiding warnings with broad filters.

## Evidence reviewed

- [Official Ant Design v5 to v6 guide](https://ant.design/docs/react/migration-v6)
- [Official Ant Design CLI guide](https://ant.design/docs/react/cli)
- [Official React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Comparison branch](https://github.com/formilyjs/antd/compare/master...potop:formily-antd-v6:master), fetched at commit `50d4f8ab029609d9df9858f00af9e3ad58963443`
- Current repository source, package manifests, build configuration, docs, and test inventory

## Current repository baseline

The current `master` branch is still an Ant Design 5 package:

- Root development stack: React `^18.2.0`, React DOM `^18.2.0`, Ant Design `^5.13.0`, React types 18, and TypeScript `^4.1.5`.
- The main package is `@formily/antd-v5`; its peer ranges still include React 16/17 and require Ant Design 5.
- `tsconfig.json` uses the classic `"jsx": "react"` transform, while React 19 requires the modern JSX transform.
- `packages/components/src/__builtins__/render.ts` reads React DOM internals and falls back to removed APIs including `render` and `unmountComponentAtNode`.
- The source contains `antd/lib/*` deep imports and manual Ant Design style imports that are not valid public v6 integration points.
- Direct v6 deprecation sites include `Steps.Step`, Tooltip/Popover `overlayClassName` and `destroyTooltipOnHide`, Button `type="ghost"`, and the Table pagination default size.
- Repository URLs, badges, documentation imports, package READMEs, and the site navigation still reference `formilyjs/antd`, `@formily/antd-v5`, or the Ant Design 5 site.
- The current test suite contains only one test file, `packages/components/src/__tests__/dayjs.spec.ts`; it does not exercise rendering, portals, wrappers, deprecated warnings, or the documentation demos.
- CI is pinned to Node 14 and old checkout/setup actions. It does not run a docs build, package-install smoke test, explicit type-check, or warning audit.

## Changes required by the official guides

### React 19 checklist

| Official change                                                                                                                                      | Repository action                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modern JSX transform is required                                                                                                                     | Move build and Jest TypeScript configs to `react-jsx` (or prove the builder supplies the automatic runtime), then inspect built output to ensure the legacy-transform warning cannot occur. |
| Upgrade React, React DOM, and their types together                                                                                                   | Pin a tested React 19 line consistently in root dev dependencies, package peer dependencies, lockfile, CI, and consumer fixture.                                                            |
| Removed `ReactDOM.render`, `hydrate`, and `unmountComponentAtNode`                                                                                   | Replace the compatibility shim with `createRoot`/`Root.unmount`; keep one root per container and define an asynchronous unmount contract for portal cleanup.                                |
| React internals are renamed/unsupported                                                                                                              | Remove all access to `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` and any warning-toggle hack.                                                                                      |
| `act` moved from `react-dom/test-utils`                                                                                                              | Import `act` from React or use React Testing Library; add a static check so the old import cannot return.                                                                                   |
| `findDOMNode`, legacy context, string refs, module factories, `createFactory`, function `propTypes`/`defaultProps`, and shallow renderer are removed | Run the official codemods and a repository-wide audit. No current production hit was found, but docs and newly added tests must be included in the check.                                   |
| `element.ref` is deprecated                                                                                                                          | Do not inspect element refs; pass refs through component props and `forwardRef`.                                                                                                            |
| Ref callbacks may return cleanup functions                                                                                                           | Ensure ref callbacks do not accidentally return assigned nodes; cover sortable and portal refs.                                                                                             |
| `useRef` requires an initial value and `MutableRefObject` is deprecated                                                                              | Add explicit `null`/`undefined` initializers and migrate helper types to `RefObject`/`Ref` with accurate nullability.                                                                       |
| `ReactElement` props default to `unknown`                                                                                                            | Add explicit prop types at clone/introspection sites instead of applying repository-wide `any` casts.                                                                                       |
| JSX namespace is scoped and `useReducer` typing changed                                                                                              | Run the React 19 types codemod and type-check all source, demos, and emitted declarations.                                                                                                  |
| `react-test-renderer` is deprecated and React 19 uses concurrent rendering                                                                           | Use React Testing Library for new tests and do not add `react-test-renderer` snapshots. Await rendering/unmount operations.                                                                 |
| Render error reporting changed                                                                                                                       | Test portal/dialog cleanup and make the test harness fail on both caught and uncaught React errors.                                                                                         |
| React UMD builds were removed                                                                                                                        | Either remove this library's advertised UMD path or provide and test a documented ESM-based consumption path; do not leave untested UMD claims in package metadata.                         |

Run the official recipes on a temporary branch and review every change rather than accepting them blindly:

```bash
npx codemod@latest react/19/migration-recipe
npx types-react-codemod@latest preset-19 .
```

### Ant Design 6 checklist

Global requirements:

- Upgrade to Ant Design 6 and `@ant-design/icons >=6` together.
- Remove any React 19 patch package if one is introduced during intermediate testing; Ant Design 6 supports React 19 directly.
- Support only modern browsers with CSS variables. Remove IE/legacy-browser promises and verify CSS-in-JS, SSR style registration, custom prefixes, CSP nonces, and any zero-runtime behavior that this package claims.
- Audit custom styles against Ant Design 6 DOM changes. This repository mostly generates its own `formily-*` selectors, but overlay/container lookups and portal layouts require browser-level smoke tests.
- Decide and document v6 behavior for overlay masks, Tag spacing, and Form/List submission semantics even if the adapter does not directly override them.

Relevant component API changes for this repository and its public wrapper surface:

| Area                                                 | Required migration                                                                                                                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ant-design/icons`                                  | Upgrade the direct dependency from v5 to v6.                                                                                                                                                               |
| Type/style imports                                   | Replace `antd/lib/*` imports with supported public exports or type-only `antd/es/*` imports; remove obsolete `antd/lib/*/style/index` imports.                                                             |
| Button array operations                              | Replace `type="ghost"` with `type="default" ghost`.                                                                                                                                                        |
| Card / `ArrayCards`                                  | Replace Ant Design Card `bordered` with `variant`. Keep Formily's unrelated `FormItem`/`FormLayout` `bordered` API unchanged.                                                                              |
| Cascader, Select, TreeSelect                         | Retain `suffixIcon` for the loading indicator. Migrate their deprecated popup, visibility, `bordered`, and `showArrow` props if the adapter or demos use them. Do **not** rename `suffixIcon` to `suffix`. |
| Collapse                                             | Replace `destroyInactivePanel` with `destroyOnHidden`, `expandIconPosition` with `expandIconPlacement`, and panel `disabled` with `collapsible="disabled"` where used.                                     |
| DatePicker/RangePicker                               | Migrate popup class/style, `bordered`, and `onSelect` usage; ensure date adapter typing still works.                                                                                                       |
| Drawer and Modal                                     | Migrate legacy body/header/footer/mask styles, destroy options, size options, focus/mask options, and any affected portal DOM lookups.                                                                     |
| Input/InputNumber                                    | Replace passed-through Ant Design `bordered` with `variant`; InputNumber addons should use `Space.Compact`. Formily's own decorator addons are not Ant Design props and may remain.                        |
| Steps / `FormStep`                                   | Replace `Steps.Step` children with `items`; migrate direction, label placement, descriptions/content, dot mode, and `size="default"`.                                                                      |
| Table / `ArrayTable` / `SelectTable`                 | Remove `size="default"`; use `medium` or leave size undefined. Audit pagination `position`, filter dropdown state, and row-selection callbacks.                                                            |
| Tabs / `FormTab` / `ArrayTabs`                       | Use `items`, `tabPlacement`, `destroyOnHidden`, semantic popup class names, and the new indicator object where relevant.                                                                                   |
| Tooltip/Popover / `Editable` / `FormItem`            | Replace overlay class/style props with `classNames`/`styles`; replace `destroyTooltipOnHide` with `destroyOnHidden`.                                                                                       |
| Transfer                                             | Replace `listStyle`/`operationStyle`/`operations` with `styles.section`/`styles.actions`/`actions` in owned examples and public guidance.                                                                  |
| Space                                                | Replace `direction` with `orientation` and `split` with `separator` where used.                                                                                                                            |
| Badge, Switch, Spin, Descriptions, Divider, Progress | Replace deprecated `default`/`middle` sizes if they appear in docs, schemas, or passthrough defaults.                                                                                                      |
| All wrappers                                         | Audit inherited Ant Design props and docs, not only props set internally by the adapter. A wrapper can compile while still advertising a deprecated v6 API.                                                |

Use the official CLI after the v6 dependency is installed:

```bash
antd doctor
antd usage packages/components/src
antd lint packages/components/src
antd lint docs
antd migrate 5 6
```

## Assessment of the comparison branch

The comparison has 14 migration-related commits and changes 201 files, but it adds no tests. Port changes selectively in small commits.

### Port or reproduce with tests

- Upgrade React/React DOM/types, Ant Design, icons, CSS-in-JS, Formily packages, and TypeScript as one coherent dependency set.
- Replace the React DOM compatibility shim with `createRoot` and asynchronous root unmounting, and update portal host removal accordingly.
- Replace obsolete deep imports and manual component-style imports.
- Add explicit `useRef` initial values and correct ref nullability.
- Move from `MutableRefObject` to `RefObject` in `useClickAway`.
- Correct forwarded element types for Ant Design buttons and sortable table elements.
- Render sortable components through React rather than invoking a function component directly; retain useful display names.
- Replace Button ghost type, `Steps.Step`, overlay props, `destroyTooltipOnHide`, and Table's `default` size.
- Preserve the `calcFactor` fix: breakpoint index `0` must select the first responsive value instead of falling through to the last value. Add a regression test because this is a real behavioral bug, not only a type fix.
- Add a clean `ArrayCards` `variant` API and migrate examples.

### Rework before accepting

- The CSS-in-JS change uses `theme as any` and returns a hand-written passthrough wrapper. Replace this with types and return contracts that match `@ant-design/cssinjs` v2, then test style injection, hash classes, CSP nonce handling, SSR extraction, and ConfigProvider CSS variables.
- The comparison advertises React `>=18` while building only one React version. Declare only the range covered by CI; the recommended initial major release range is React/React DOM `>=19 <20`, Ant Design `>=6 <7`, then broaden only after an explicit React 18 compatibility job passes.
- Keep `@types/react` and `@types/react-dom` as development/type build inputs unless a packed-consumer test proves they must be peer dependencies.
- Validate each `unknown as`/`any` cast. Narrow casts at library boundaries are acceptable only with a regression test; broad casts must not substitute for React 19 typing work.
- Keep the English and Chinese docs in sync. The comparison deletes the root Chinese README and should not be followed here.
- Apply documentation import changes after the final package identity is selected, avoiding a formatting-only rewrite of hundreds of files in the same commit as runtime changes.

### Reject

- Reject `suffixIcon -> suffix` in Cascader, Select, and TreeSelect. Ant Design 6 still exposes and uses `suffixIcon`; this comparison change breaks the loading indicator.
- Reject copying `@potop/*` names, URLs, release metadata, `gitHead` fields, or registry configuration.
- Do not copy the comparison's `.npmrc`. Registry authentication belongs in release automation and must use the actual chosen scope; no token-bearing repository configuration is needed for local consumers.
- Do not use `NODE_OPTIONS=--openssl-legacy-provider` as the permanent docs-build solution. Upgrade or replace the stale Dumi/Webpack path; if a temporary compatibility flag is unavoidable, track it as an explicit blocker and remove it before the exit gate.
- Do not silence deprecated APIs with blanket ESLint disables. A narrowly documented compatibility read is acceptable only when it does not pass the deprecated prop into Ant Design and has a removal test/plan; the preferred major-version behavior is to remove the old prop and document the break.

## Implementation plan

Each phase ends with its own gate. Do not start the next phase while a failure introduced in the current phase remains unexplained.

### Phase 0 — Freeze the baseline and distribution contract

1. Record the current branch, clean/dirty state, Node/Yarn versions, and baseline results for immutable install, build, docs build, lint, and tests. Preserve any user-owned changes.
2. Save full logs so pre-existing failures are distinguishable from migration regressions.
3. Decide the package identity before mass-renaming imports. The Git repository metadata is fixed: <https://github.com/thienvu18/antd>.
4. Recommended initial package identity: `@thienvu18/formily-antd-v6` plus consistently named companion workspaces, provided that npm or GitHub Packages publishing rights exist. If the package will not be published, document clone/build/tarball installation instead.
5. Do not document `npm install github:thienvu18/antd` unless a clean consumer smoke test proves it works. The current Git root is a private monorepo package and does not expose the components workspace as its installable entry point.
6. Define the supported Node and browser matrix using maintained Node releases and modern CSS-variable-capable browsers.

Phase gate:

- Baseline results and known failures are recorded.
- Package/release identity and install mechanism are explicit.
- No code behavior changes are mixed into this phase.

### Phase 1 — Modernize dependencies and build/type infrastructure

1. Update React, React DOM, React types, Ant Design 6, icons 6, CSS-in-JS v2, and the aligned Formily `2.3.7` packages.
2. Upgrade TypeScript to a version supported by React 19 types and every builder/test integration. Prefer one root TypeScript version instead of a resolution that masks incompatible plugins.
3. Replace or upgrade stale Dumi/Webpack, Jest, ts-jest, Testing Library, ESLint, TypeScript ESLint, and related config only as needed to run on the supported Node matrix without legacy OpenSSL flags or deprecation warnings.
4. Switch every applicable TypeScript/Babel path to the modern JSX transform.
5. Update all workspace peer dependencies and remove React 16/17 and Ant Design 5 claims.
6. Regenerate and review `yarn.lock`; check for duplicate React, React DOM, Ant Design, icons, and CSS-in-JS majors.
7. Add explicit scripts for type-check, package build, docs build, deprecated-API audit, tests, pack, and the complete verification gate.

Phase gate:

- Immutable install succeeds with the new dependency set and no peer errors.
- A minimal type-check reaches source errors rather than failing in obsolete tooling.
- The docs builder starts without `--openssl-legacy-provider`.
- Dependency tree contains one intended React/React DOM/Ant Design major.

### Phase 2 — Migrate React 19 runtime and types test-first

1. Add failing tests for root reuse, rerender, asynchronous unmount, repeated unmount, portal host removal, and portal cleanup after close.
2. Replace `__builtins__/render.ts` with a typed `createRoot` implementation. Store `Root` per container and never inspect React internals.
3. Update `__builtins__/portal.tsx` to await/chain the explicit unmount result before removing the host, including already-detached hosts.
4. Add explicit ref initializers and accurate `RefObject`/`Ref` types in Editable, dialogs, drawers, responsive layout, sortable helpers, and table bodies.
5. Correct implicit ref callback returns and `ReactElement<...>` clone sites.
6. Render sortable components as elements and validate ref forwarding; never call a component function directly.
7. Apply the React codemods, review the diff, and manually fix anything the codemods cannot safely infer.
8. Exercise the runtime tests under `StrictMode` to expose unsafe render side effects.

Phase gate:

- No removed React/React DOM API or internal symbol remains in source, docs, tests, or built output.
- React runtime/type tests pass without console warnings.
- The modern JSX transform is present in emitted code.

### Phase 3 — Migrate Ant Design 6 APIs and styles test-first

1. Add focused failing tests for every adapter behavior about to change, especially loading icons, array operations, Card variants, FormStep item mapping, table pagination size, overlays, and style registration.
2. Replace deep imports with public/type-only imports and delete obsolete manual style imports.
3. Migrate owned deprecated props listed in the component matrix above.
4. Keep Cascader/Select/TreeSelect loading state on `suffixIcon`; add assertions that the custom icon is visible both during Formily loading/validation and when a consumer supplies a normal suffix icon.
5. Convert FormStep to `items` while preserving schema order, title/description, current step, and rendered field content.
6. Replace `ArrayCards.bordered` with `variant`. Do not leak the removed prop into Ant Design Card. Update schema typings and examples together.
7. Correct Table pagination size without converting `undefined` to a deprecated value.
8. Adapt the CSS-in-JS helper to v2 without blanket casts. Verify light/dark tokens, custom `prefixCls`, hashed and unhashed modes, CSS variables, CSP nonce, client injection, and SSR extraction if exported behavior relies on them.
9. Review all DOM queries in FormDialog/FormDrawer/Editable against v6 DOM, including focus, footer/extra portals, close cleanup, and nested overlays.
10. Run `antd doctor`, `antd usage`, and `antd lint` on source and docs; resolve every applicable report.

Phase gate:

- Source has no `antd/lib/*`, removed subcomponent API, or owned deprecated v6 prop usage.
- Ant Design CLI reports no applicable deprecated usages in source or docs.
- Focused wrapper/style/portal tests pass with zero warnings.
- Dark theme, custom prefix, and at least one CSS-variable configuration render correctly.

### Phase 4 — Expand regression coverage and make warnings fatal

1. Preserve the existing Day.js tests unchanged unless a documented behavior change requires an assertion update.
2. Add React Testing Library suites for public adapters: inputs, date/time, choices, arrays, tabs/steps/collapse, table/transfer/upload, decorators, submit/reset, dialogs/drawers, preview text, and sortable behavior.
3. Add a public-export smoke test that imports every exported component and renders representative Formily schemas.
4. Add tests for the comparison branch's responsive breakpoint-index fix.
5. Update global test setup so unexpected `console.error`, `console.warn`, `window.reportError`, and unhandled rejections fail the test while preserving complete multi-argument diagnostics.
6. Test concurrent close/unmount and StrictMode double invocation.
7. Type-check docs/demos, not just library source, so stale imports and deprecated props cannot hide in examples.

Phase gate:

- All old and new tests pass in development and production test modes.
- No warning allowlist is required for React or Ant Design.
- Coverage includes each migrated branch; any deliberate exception is documented with a focused test.

### Phase 5 — Package metadata, installation, and migration documentation

1. Update repository, bugs, homepage, badges, contributor image, code coverage link, site navigation, changelog links, and all workspace manifests to `https://github.com/thienvu18/antd`.
2. Update the site title and copy from Ant Design 5 to Ant Design 6 while retaining both English and Chinese entry points.
3. Replace all `@formily/antd-v5` imports/install commands with the selected package identity. Do the same for prototypes, renderer, setters, and settings-form packages.
4. Add `docs/migration-v6.md` and `docs/migration-v6.zh-CN.md`, and link them from both root READMEs and docs indexes.
5. The migration guide must include:
   - React 19, React DOM 19, Ant Design 6, icons 6, Node, browser, and CSS-variable requirements.
   - Exact old-to-new install and import commands.
   - Package rename and repository ownership.
   - Dropped React 16/17, Ant Design 5, IE/legacy-browser, and any UMD support.
   - `ArrayCards.bordered -> variant` and any other adapter-level prop/type breaks.
   - Ant Design 6 overlay, Tag spacing, size enum, Form/List submission, DOM/style-selector, and deprecated prop effects relevant to consumers.
   - React 19 ref, root/unmount, error-reporting, JSX transform, and TypeScript changes relevant to extension authors.
   - Before/after snippets and an upgrade checklist.
6. Run `npm pack --dry-run` (or equivalent) for every published workspace, inspect included files, and install the produced tarballs into a clean fixture rather than testing through workspace aliases.
7. Verify README install commands exactly as written against the chosen registry or release artifact.

Phase gate:

- No stale upstream repo, Ant Design 5 site, or old package identity remains except intentional migration-history examples.
- English and Chinese migration docs agree on requirements and breaking changes.
- Every documented install command is executable and verified.
- Packed declarations resolve with a clean consumer's React 19 types.

### Phase 6 — CI and final exit-gate closure

1. Replace obsolete CI actions and Node 14 with the supported Node matrix.
2. Use an immutable install and cache keyed by the lockfile.
3. Add separate CI jobs for lint/deprecation audit, type-check, package build, docs build, tests/coverage, package packing, and React 19 consumer smoke testing.
4. Capture stdout/stderr for build, docs, and test commands and fail on React/Ant Design deprecated warnings.
5. In the consumer fixture, test ESM/CommonJS entry points that remain advertised, render a representative Formily form, open/close a dialog or drawer, and unmount the root.
6. Run the complete gate twice: once from the developer worktree and once from a clean checkout using only committed files.

Final commands should be consolidated behind one documented script, conceptually:

```bash
corepack enable
yarn install --immutable
yarn lint
yarn typecheck
yarn build
yarn build:docs
CI=true yarn test:prod --runInBand
yarn verify:pack
git diff --check
```

Final evidence must record command, environment, exit code, test count, and warning count. A green package build alone is not sufficient.

## Expected breaking changes to document

At minimum, expect these consumer-visible breaks:

- React 16/17 and Ant Design 5 are no longer supported; the initial release should require the tested React 19 and Ant Design 6 ranges.
- The package/import name changes from `@formily/antd-v5` to the selected v6 distribution name.
- Ant Design 6 requires modern browsers and CSS variables; IE and legacy DOM/style assumptions are unsupported.
- Deprecated Ant Design props exposed through adapter components are removed or replaced by v6 equivalents.
- `ArrayCards` uses `variant` instead of the Ant Design Card `bordered` prop.
- Ant Design 6 size values use `medium` rather than `default`/`middle` for affected components.
- DOM and semantic style slots may change custom selectors and overlay styling.
- Form/List submitted values, Tag spacing, and overlay mask behavior follow Ant Design 6 semantics.
- React extension code must use the modern JSX transform, React 19 ref types, and root APIs.
- Any untested UMD entry points are removed rather than advertised.

The exact list must be generated from the final diff and validated against the packed public TypeScript declarations before release.

## Recommended commit sequence

Keep reviewable boundaries:

1. `test: capture react19 and antd6 migration behavior`
2. `build: upgrade react19 antd6 and toolchain`
3. `refactor: migrate react19 roots refs and jsx runtime`
4. `refactor: migrate antd6 component APIs and styles`
5. `test: add warning-free adapter and package smoke coverage`
6. `docs: add v6 migration guide and thienvu18 links`
7. `ci: enforce clean react19 antd6 exit gate`

Do not mix generated lockfile churn, mass documentation formatting, runtime fixes, and package renames in one commit.
