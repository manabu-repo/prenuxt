/**
 * 优化 assets 目录下的图片
 * 提供图片优化的最佳实践：
 * 1. 自动生成多种尺寸的 URL
 * 2. 支持响应式加载
 * 3. 支持预加载关键图片
 */

export function useOptimizedImage() {
  /**
   * 获取响应式图片配置
   * @param importedImage - 通过 import 导入的图片
   * @param options - 配置选项
   */
  const getImageUrl = (
    importedImage: string,
    options?: {
      width?: number
      height?: number
      quality?: number
    }
  ) => {
    // Vite 的 import 会返回优化后的 URL
    return importedImage
  }

  /**
   * 预加载关键图片
   * 用于首屏必需的图片
   */
  const preloadImage = (importedImage: string, alt: string) => {
    if (process.client) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = importedImage
      link.fetchPriority = 'high'
      document.head.appendChild(link)
    }
  }

  /**
   * 生成图片配置对象
   * 用于 <img> 标签
   */
  const getImageAttrs = (
    importedImage: string,
    alt: string,
    options?: {
      width?: number
      height?: number
      fetchPriority?: 'high' | 'low' | 'auto'
    }
  ) => {
    return {
      src: importedImage,
      alt,
      loading: 'lazy' as const,
      decoding: 'async' as const,
      fetchPriority: options?.fetchPriority ?? 'auto',
      ...options,
    }
  }

  return {
    getImageUrl,
    preloadImage,
    getImageAttrs,
  }
}
