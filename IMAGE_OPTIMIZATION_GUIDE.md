# LCP 优化指南

## 当前问题
- **图片文件大小**：1.8MB（`ian-1.png`）
- **优化目标**：< 100KB（推荐）

## 立即行动

### 1. 压缩现有图片

使用以下工具进行有损压缩：

```bash
# 使用 ImageOptim（Mac 图形化）
# 下载：https://imageoptim.com/
# 直接拖入图片自动优化

# 或使用命令行工具
npm install -g imagemin imagemin-mozjpeg imagemin-pngquant

# 压缩 PNG
imagemin public/images/ian-1.png --out-dir=public/images --plugin=pngquant

# 压缩 JPEG
imagemin public/images/flower.jpg --out-dir=public/images --plugin=mozjpeg --plugin-options='{"quality": 80}'
```

### 2. 生成多种尺寸

```bash
# 使用 Sharp 生成响应式图片
npm install -g sharp-cli

sharp public/images/ian-1.png \
  -o public/images/ian-1-sm.png resize 400 --withoutEnlargement \
  -o public/images/ian-1-md.png resize 800 --withoutEnlargement
```

### 3. 使用 WebP 格式

```bash
# 转换为 WebP
cwebp public/images/ian-1.png -o public/images/ian-1.webp -q 80
```

## 更新配置

使用 srcset 提供多个尺寸：

```vue
<NuxtImg
  src="/images/ian-1.webp"
  srcset="/images/ian-1-sm.webp 400w, /images/ian-1.webp 800w"
  alt="Image"
  width="800"
  height="600"
  loading="eager"
  fetchpriority="high"
/>
```

## 预期效果

| 措施 | 原始大小 | 优化后 | 改善 |
|---|---|---|---|
| 有损 PNG 压缩 | 1.8MB | ~200-300KB | -83% |
| 转换 WebP | 200KB | ~100-150KB | -50% |
| 响应式加载 | 150KB | 50-100KB | -66% |
| **总体** | **1.8MB** | **~50-80KB** | **-95%** |

## LCP 改善

- ❌ 原始：LCP ≈ 3-4s（图片下载时间）
- ✅ 优化后：LCP < 1.5s（符合 "Good" 标准）

## 自动化方案

添加到 npm scripts：

```json
{
  "scripts": {
    "optimize:images": "imagemin 'public/images/**/*.{png,jpg}' --out-dir=public/images"
  }
}
```

运行：
```bash
npm run optimize:images
```
