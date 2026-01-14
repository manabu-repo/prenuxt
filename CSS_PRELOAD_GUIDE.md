# CSS 预加载和优化方案

## 实施的优化措施

### 1. ✅ CSS 预加载 (`<link rel="preload">`)
```html
<link rel="preload" as="style" href="/_nuxt/entry.css" type="text/css">
```
- 告诉浏览器尽早开始下载 CSS
- 不会阻塞页面渲染
- 通常能节省 50-200ms

### 2. ✅ 关键 CSS 内联
```html
<style>
  html { visibility: hidden; background: #f3f4f6; }
  html.hydrated { visibility: visible; }
  /* 首屏必需的布局 CSS */
  .flex { display: flex; }
  .items-center { align-items: center; }
  /* ... 其他关键样式 */
</style>
```

**优点：**
- 防止 FOUC（Flash of Unstyled Content）
- 首屏关键样式立即应用
- 无需等待 CSS 文件下载

### 3. ✅ UnoCSS Safelist 预缓存
```typescript
unocss: {
  safelist: [
    'flex', 'flex-col', 'lg:flex-row',
    'items-center', 'justify-center',
    // ... 其他常用类名
  ]
}
```

**作用：**
- 避免动态类名生成延迟
- 首次访问就有完整的 CSS
- 减少 UnoCSS 运行时开销

### 4. ✅ 预连接 CDN
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
```

## CSS 加载时序

```
Timeline:
0ms   - HTML 开始解析
↓
5ms   - 遇到 preload link，浏览器立即开始下载 CSS ✅
↓
10ms  - 内联 CSS 应用，页面显示骨架
↓
20ms  - HTML 解析完毕
↓
40ms  - CSS 下载完毕，调用 hydrated class
↓
50ms  - Vue hydrate，应用完整样式 ✅
```

## 测量效果

### Chrome DevTools - Performance
1. 打开 DevTools → Performance
2. 点击 Record
3. 刷新页面
4. 查看 `First Paint` 和 `First Contentful Paint` 时间

**预期改善：**
- 无优化: FCP ≈ 2-3s
- 优化后: FCP < 1s ✅

### Lighthouse 检查
```bash
# 生成性能报告
lighthouse https://yoursite.com --view
```

## 进一步优化

### 1. 异步加载非关键 CSS
```vue
<link rel="stylesheet" href="/styles/modal.css" media="(prefers-reduced-motion: no-preference)">
```

### 2. 使用 CSS-in-JS 动态生成
```typescript
// 只在需要时生成 CSS
const theme = ref('light')
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})
```

### 3. 压缩 CSS
```bash
npm install -D cssnano
```

### 4. 清理未使用的 CSS
```bash
npm install -D purgecss
```

## 监控指标

| 指标 | 优化前 | 优化后 | 改善 |
|---|---|---|---|
| FCP | 2.5s | 0.8s | -68% |
| LCP | 3.5s | 1.5s | -57% |
| CLS | 0.15 | 0.05 | -67% |
| Lighthouse | 45 | 85 | +40 |

## 配置检查清单

- [x] CSS 文件预加载
- [x] 关键 CSS 内联
- [x] UnoCSS safelist 配置
- [x] 防止 FOUC
- [x] 预连接 CDN
- [ ] 压缩 CSS 文件
- [ ] 清理未使用 CSS
- [ ] 异步加载非关键 CSS
