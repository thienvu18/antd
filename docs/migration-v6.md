---
title: Migrating to React 19 and Ant Design 6
order: 1
---

# Migrating to React 19 and Ant Design 6

This release is a new major distribution: `@thienvu18/formily-antd-v6`. It requires React 19 and Ant Design 6.

## Upgrade dependencies

```bash
npm remove @formily/antd-v5 @ant-design/v5-patch-for-react-19
npm install react@19 react-dom@19 react-is@19 antd@6 @ant-design/icons@6 dayjs
npm install @formily/core @formily/react @thienvu18/formily-antd-v6
```

Update imports from `@formily/antd-v5` to `@thienvu18/formily-antd-v6`. The companion packages use the same prefix: `-prototypes`, `-renderer`, `-setters`, and `-settings-form`.

## Breaking changes

- React 18 and Ant Design 5 are no longer supported. Applications must use the modern JSX transform and `createRoot`.
- Ant Design no longer supports legacy deep CSS imports such as `antd/lib/date-picker/style`; styles are supplied by the Ant Design 6 CSS-in-JS runtime.
- Ant Design's `Button` no longer accepts `type="ghost"`. Use `type="default" ghost`.
- `Popover.overlayClassName` and `destroyTooltipOnHide` are replaced by `classNames.root` and `destroyOnHidden`.
- `FormStep` renders Ant Design `Steps` through `items`; code must not depend on `Steps.Step` being mounted as a child.
- `ArrayCards.bordered` is removed. Use `variant="outlined"` or `variant="borderless"`.
- `Table`/`Pagination` sizes use Ant Design 6 values: `small`, `middle`, and `large`; replace legacy `default` values with `middle`.

## Validation checklist

Use Node 20, 22, or 24 and modern CSS-variable-capable browsers. IE and other legacy browsers are unsupported. Enable the pinned package manager once with `corepack enable`, then run `yarn verify`; it type-checks, audits deprecated APIs, builds the package and documentation, tests with warnings treated as failures, and validates packed artifacts in a clean React 19 consumer.
