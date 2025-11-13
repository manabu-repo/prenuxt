# dompdf.js 分页限制说明

## ⚠️ 重要发现

经过源码分析，**dompdf.js v1.0.4 不支持自动分页功能**。

## 问题根源

dompdf.js 实际上是基于 `html2canvas + jsPDF` 的简化实现，它的工作方式是：

1. 使用 html2canvas 将整个 HTML 元素渲染为一张图片
2. 将图片嵌入到单页 PDF 中
3. **没有自动分页逻辑**

这导致：
- ✅ 生成的 PDF 可编辑、可打印（相比 html2pdf.js 的纯图片）
- ✅ 渲染质量较好
- ❌ **无法自动分页，长内容会显示在单页上**
- ❌ 超长内容可能被截断或显示不全

## 已验证的事实

1. **类型定义中没有分页API**
   - 查看 `index.d.ts` - 没有 pagebreak 相关选项
   - 查看 `pdf-renderer.d.ts` - 只有基础渲染选项

2. **README文档误导**
   - GitHub上的中文文档提到了分页（`pagebreak`），但这可能是其他分支或版本
   - npm安装的v1.0.4版本 **不包含这些功能**

3. **源码确认**
   - 搜索源码未发现 `addPage` 或分页相关逻辑
   - 只在 context2d 的 autoPaging 上下文中找到分页代码

## 解决方案

### 方案1：使用 html2pdf.js（推荐用于客户端图片分页）

```typescript
import { useHtml2pdf } from '~/composables/useHtml2pdf'

const { exportQuillToPdf } = useHtml2pdf()
await exportQuillToPdf('#quill-editor')
```

**优点：**
- ✅ 自动分页（通过 jsPDF.html()）
- ✅ 客户端生成，无需服务器
- ✅ 支持添加页码

**缺点：**
- ❌ 生成的是图片PDF，不可编辑

### 方案2：使用 Playwright（推荐用于完美质量）

```typescript
import { usePlaywright } from '~/composables/usePlaywright'

const { exportQuillToPdf } = usePlaywright()
await exportQuillToPdf('#quill-editor')
```

**优点：**
- ✅ 完美的分页
- ✅ 真正的 PDF（可编辑、可搜索）
- ✅ 浏览器级别渲染质量

**缺点：**
- ❌ 需要服务端支持
- ❌ 首次加载较慢

### 方案3：使用 pdfmake（推荐用于结构化文档）

```typescript
import { usePdfmake } from '~/composables/usePdfmake'

const { exportQuillToPdf } = usePdfmake()
await exportQuillToPdf('#quill-editor')
```

**优点：**
- ✅ 自动分页
- ✅ 真正的 PDF
- ✅ 完全客户端

**缺点：**
- ❌ 需要转换HTML为pdfmake格式
- ❌ 复杂样式支持有限

## dompdf.js 适用场景

虽然不支持分页，dompdf.js 仍然适用于：

1. **短内容导出** - 单页内容（名片、证书等）
2. **预览用途** - 快速生成预览（不关心分页）
3. **特定尺寸** - 自定义PDF尺寸的单页文档

## 使用建议

对于本项目（Quill富文本编辑器导出），建议的方案优先级：

1. **Playwright** - 如果有服务端，且追求质量
2. **html2pdf.js** - 如果纯客户端，且可接受图片PDF
3. **pdfmake** - 如果内容结构化，且需要精确控制
4. ~~**dompdf.js**~~ - **不推荐用于长文档**

## 参考资料

- [dompdf.js GitHub](https://github.com/lmn1919/dompdf.js) - 注意版本差异
- [html2canvas 文档](https://html2canvas.hertzen.com/)
- [jsPDF 文档](https://github.com/parallax/jsPDF)

