import { onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(
  selector: string = '.v-animate',
  options: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }
) {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (process.client) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else {
            entry.target.classList.remove('is-visible')
          }
        })
      }, options)

      const elements = document.querySelectorAll(selector)
      elements.forEach((el) => observer?.observe(el))
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    observer
  }
}
