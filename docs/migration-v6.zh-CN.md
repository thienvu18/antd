---
title: 迁移到 React 19 与 Ant Design 6
order: 1
---

# 迁移到 React 19 与 Ant Design 6

此版本为新的主版本发行包：`@thienvu18/formily-antd-v6`，要求使用 React 19 与 Ant Design 6。

## 升级依赖

```bash
npm remove @formily/antd-v5 @ant-design/v5-patch-for-react-19
npm install react@19 react-dom@19 react-is@19 antd@6 @ant-design/icons@6 dayjs
npm install @formily/core @formily/react @thienvu18/formily-antd-v6
```

将 `@formily/antd-v5` 的导入替换为 `@thienvu18/formily-antd-v6`。配套包同样使用新前缀：`-prototypes`、`-renderer`、`-setters` 与 `-settings-form`。

## 不兼容变更

- 不再支持 React 18 和 Ant Design 5；应用必须使用现代 JSX 转换和 `createRoot`。
- 不再使用 `antd/lib/date-picker/style` 一类的深层样式导入；样式由 Ant Design 6 的 CSS-in-JS 运行时提供。
- `Button` 不再接受 `type="ghost"`，请改为 `type="default" ghost`。
- `Popover.overlayClassName`、`destroyTooltipOnHide` 分别改为 `classNames.root`、`destroyOnHidden`。
- `FormStep` 通过 Ant Design `Steps` 的 `items` 渲染，不能再依赖 `Steps.Step` 子节点。
- `ArrayCards.bordered` 已删除，请使用 `variant="outlined"` 或 `variant="borderless"`。
- `Table`/`Pagination` 的尺寸值为 `small`、`middle`、`large`；旧 `default` 请改为 `middle`。

## 验证清单

请使用 Node 20、22 或 24，以及支持 CSS 变量的现代浏览器；IE 和其他旧浏览器不受支持。先运行一次 `corepack enable` 以启用项目锁定的包管理器，然后运行 `yarn verify`；它会执行类型检查、弃用 API 审计、组件与文档构建、将警告视为失败的测试，以及干净 React 19 消费者中的打包产物验证。
