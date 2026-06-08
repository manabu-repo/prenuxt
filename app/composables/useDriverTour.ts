import { driver, type DriveStep, type Driver, type Config } from 'driver.js'
import 'driver.js/dist/driver.css'

/**
 * popover 内容类型，支持文本、HTML 和结构化内容
 */
export type PopoverContent = string | {
  text?: string
  html?: string
  image?: string
  elements?: Array<{ type: 'text' | 'image', content: string }>
}


/**
 * 处理 popover 内容，支持文字和图片混合
 */
const processPopoverContent = (content: PopoverContent): string => {
  if (typeof content === 'string') {
    return content
  }

  if ('html' in content && content.html) {
    return content.html
  }

  if ('elements' in content && content.elements) {
    return content.elements.map((el) => {
      if (el.type === 'image') {
        return `<img src="${el.content}" style="max-width: 100%; border-radius: 4px; margin: 8px 0;" />`
      }
      return `<p style="margin: 8px 0; font-size: 14px;">${el.content}</p>`
    }).join('')
  }

  if ('text' in content && content.text) {
    return content.text
  }

  if ('image' in content && content.image) {
    return `<img src="${content.image}" style="max-width: 100%; border-radius: 4px;" />`
  }

  return ''
}

/**
 * usage:
 * const { startTour } = useDriverTour()
 * startTour([
 *   { element: '#step1', popover: { title: 'Welcome', description: 'Start here' } },
 *   { element: '#step2', popover: { title: 'Next', description: 'Continue' } }
 * ])
 */
export function useDriverTour() {
  let driverInstance: Driver | null = null
  const tourConfig = ref<DriveStep[]>([])

  const createTour = (config?: Config) => {
    driverInstance = driver(config)
    return driverInstance
  }

  const setTourSteps = (steps: DriveStep[]) => {
    tourConfig.value = steps
  }

  const startTour = (steps?: DriveStep[], config?: Config) => {
    const stepsToUse = steps || tourConfig.value
    if (!stepsToUse.length) return

    // 处理 popover 内容，支持文字 + 图片
    const processedSteps = stepsToUse.map((step: any) => {
      if (step.popover?.description) {
        const description = processPopoverContent(step.popover.description)
        return {
          ...step,
          popover: {
            ...step.popover,
            description,
          },
        }
      }
      return step
    })

    if (!driverInstance) {
      driverInstance = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        ...config,
        steps: processedSteps,
      })
    }
    driverInstance.drive()
  }

  const autoStart = (steps: DriveStep[], config?: Config, delay = 0) => {
    if (delay > 0) {
      setTimeout(() => startTour(steps, config), delay)
    }
    else {
      startTour(steps, config)
    }
  }

  const highlight = (element: string | Element, config?: Omit<DriveStep, 'element'>) => {
    if (!driverInstance) {
      driverInstance = driver()
    }
    driverInstance.highlight({
      element: typeof element === 'string' ? element : element as any,
      ...config,
    })
  }

  const destroy = () => {
    if (driverInstance) {
      driverInstance.destroy()
      driverInstance = null
    }
  }

  const moveNext = () => {
    driverInstance?.moveNext()
  }

  const movePrevious = () => {
    driverInstance?.movePrevious()
  }

  const moveTo = (index: number) => {
    driverInstance?.moveTo(index)
  }

  const hasNextStep = () => {
    return driverInstance?.hasNextStep() ?? false
  }

  const hasPreviousStep = () => {
    return driverInstance?.hasPreviousStep() ?? false
  }

  const getActiveIndex = () => {
    return driverInstance?.getActiveIndex()
  }

  const isActive = () => {
    return driverInstance?.isActive() ?? false
  }

  const refresh = () => {
    driverInstance?.refresh()
  }

  // 按钮配置类型
  type ButtonConfig = {
    showButtons?: (string | boolean)[]
    buttonStyles?: Record<string, any>
    hideButtons?: string[]
  }

  /**
   * 创建带按钮配置的导航
   * @param steps 导航步骤
   * @param buttonConfig 按钮配置
   * @param config 其他配置
   */
  const startTourWithButtons = (steps: DriveStep[], buttonConfig?: ButtonConfig, config?: Config) => {
    const { showButtons = ['next', 'previous', 'close'], hideButtons = [] } = buttonConfig || {}

    // 过滤隐藏的按钮
    const filteredButtons = showButtons.filter(btn =>
      typeof btn === 'string' && !hideButtons.includes(btn),
    )

    const stepsToUse = steps || tourConfig.value
    if (!stepsToUse.length) return

    // 处理 popover 内容，支持文字 + 图片
    const processedSteps = stepsToUse.map((step) => {
      if (step.popover?.description) {
        const description = processPopoverContent(step.popover.description)
        return {
          ...step,
          popover: {
            ...step.popover,
            description,
          },
        }
      }
      return step
    })

    if (!driverInstance) {
      driverInstance = driver({
        showProgress: true,
        showButtons: filteredButtons as any[],
        ...config,
        steps: processedSteps,
      })
    }
    driverInstance.drive()
  }

  /**
   * 自动启动带按钮配置的导航
   */
  const autoStartWithButtons = (steps: DriveStep[], buttonConfig?: ButtonConfig, config?: Config, delay = 0) => {
    if (delay > 0) {
      setTimeout(() => startTourWithButtons(steps, buttonConfig, config), delay)
    }
    else {
      startTourWithButtons(steps, buttonConfig, config)
    }
  }

  /**
   * 预设按钮配置
   */
  const buttonPresets = {
    // 仅关闭按钮
    closeOnly: () => ({ hideButtons: ['next', 'previous'] }),
    // 隐藏进度条
    noProgress: () => ({ showProgress: false }),
    // 仅下一步
    nextOnly: () => ({ hideButtons: ['previous', 'close'] }),
    // 仅上一步
    previousOnly: () => ({ hideButtons: ['next', 'close'] }),
  }

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    createTour,
    setTourSteps,
    startTour,
    autoStart,
    startTourWithButtons,
    autoStartWithButtons,
    highlight,
    destroy,
    moveNext,
    movePrevious,
    moveTo,
    hasNextStep,
    hasPreviousStep,
    getActiveIndex,
    isActive,
    refresh,
    buttonPresets,
    driverInstance: computed(() => driverInstance),
  }
}
