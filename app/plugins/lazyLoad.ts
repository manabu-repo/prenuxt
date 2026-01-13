/**
 * v-lazy-load 指令 - 使用 Intersection Observer 实现延迟加载
 * 提供比原生 loading="lazy" 更多的控制
 */

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazy-load', {
    mounted(el: HTMLImageElement) {
      if (!el.src && el.dataset.src) {
        // 如果浏览器支持原生 loading
        if ('loading' in HTMLImageElement.prototype) {
          el.loading = 'lazy'
          el.src = el.dataset.src
          return
        }

        // 使用 Intersection Observer
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              img.src = img.dataset.src || ''
              img.classList.add('lazy-loaded')
              observer.unobserve(img)
            }
          })
        }, {
          // 提前 50px 加载
          rootMargin: '50px',
        })

        observer.observe(el)
      }
    },
  })
})
