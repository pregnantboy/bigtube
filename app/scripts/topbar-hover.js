/**
 * Topbar Hover Script
 * Manages YouTube topbar visibility based on scroll position
 * Shows topbar when scrolled past the video player for better navigation
 */

// Constants
const SCROLL_THRESHOLD_OFFSET = 100 // pixels before reaching bottom of viewport
const TOPBAR_SHOW_CLASS = 'bt-show-topbar'
const MIN_VIDEO_HEIGHT_THRESHOLD = 112 // pixels (100vh - 112px threshold)
const RESIZE_DEBOUNCE_DELAY = 250 // milliseconds
const SCROLL_THROTTLE_DELAY = 160 // milliseconds

/**
 * Throttle function for scroll events (runs at most once per delay period)
 */
function throttle(func, delay) {
  let lastCall = 0

  return function (...args) {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(this, args)
    }
  }
}

/**
 * Debounce function for resize events
 */
function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * Handle scroll events and update topbar visibility
 */
function handleScrollOrResize() {
  // Cache DOM queries and calculations
  const scrollY = window.scrollY
  const viewportHeight = window.innerHeight
  const scrollThreshold = viewportHeight - SCROLL_THRESHOLD_OFFSET
  const isPastThreshold = scrollY > scrollThreshold

  // Early return if scrolled past threshold
  if (isPastThreshold) {
    document.body.classList.add(TOPBAR_SHOW_CLASS)
    return
  }

  // Only query DOM if we need to check video size
  const videoPlayer = document.querySelector('video.video-stream')
  if (videoPlayer) {
    const videoHeight = videoPlayer.offsetHeight
    const minRequiredHeight = viewportHeight - MIN_VIDEO_HEIGHT_THRESHOLD

    // Add class if video is smaller than required height
    const isVideoTooSmall = videoHeight < minRequiredHeight
    document.body.classList.toggle(TOPBAR_SHOW_CLASS, isVideoTooSmall)
  } else {
    // If no video player found, remove the class
    document.body.classList.remove(TOPBAR_SHOW_CLASS)
  }
}

/**
 * Initialize the topbar hover functionality
 */
function init() {
  // Create optimized event handlers
  const throttledScrollHandler = throttle(
    handleScrollOrResize,
    SCROLL_THROTTLE_DELAY
  )
  const debouncedResizeHandler = debounce(
    handleScrollOrResize,
    RESIZE_DEBOUNCE_DELAY
  )

  // Add scroll event listener with throttling for better performance
  window.addEventListener('scroll', throttledScrollHandler, { passive: true })

  // Add resize event listener with debouncing
  window.addEventListener('resize', debouncedResizeHandler, { passive: true })

  // Initial check
  handleScrollOrResize()

  // Also check when video player size changes
  const resizeObserver = new ResizeObserver(debouncedResizeHandler)

  // Observe the video container for size changes
  const videoContainer = document.querySelector(
    '#movie_player, .html5-video-player, ytd-player'
  )
  if (videoContainer) {
    resizeObserver.observe(videoContainer)
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
