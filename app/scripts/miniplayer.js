// Constants
const MP_SCROLL_THROTTLE_DELAY = 160 // milliseconds

const HIDE_BUTTON_HTML =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 24px; height: 24px; fill: white;"><path d="m9.4 18.4-.7-.7 5.6-5.6-5.7-5.7.7-.7 6.4 6.4-6.3 6.3z"></path></svg>'

const UNHIDE_BUTTON_HTML =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 24px; height: 24px; fill: white; transform: rotate(-90deg);"><path d="m9.4 18.4-.7-.7 5.6-5.6-5.7-5.7.7-.7 6.4 6.4-6.3 6.3z"></path></svg>'

const TO_TOP_BUTTON_HTML =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 24px; height: 24px; fill: white; transform: rotate(-90deg)"><path d="m9.4 18.4-.7-.7 5.6-5.6-5.7-5.7.7-.7 6.4 6.4-6.3 6.3z"></path></svg>'

/**
 * Combined throttle + debounce function for scroll events
 * Runs at most once per throttle delay, but ensures final call is always processed
 */
function throttleWithTrailingDebounce(func, throttleDelay, debounceDelay) {
  let lastCall = 0
  let debounceTimer = null

  return function (...args) {
    const now = Date.now()

    // Clear any pending debounced call
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // If enough time has passed since last call, execute immediately (throttle)
    if (now - lastCall >= throttleDelay) {
      lastCall = now
      func.apply(this, args)
    }

    // Always set up a debounced call to ensure final position is processed
    debounceTimer = setTimeout(() => {
      func.apply(this, args)
      debounceTimer = null
    }, debounceDelay)
  }
}

window.addEventListener('load', function () {
  const backToTopButton = document.createElement('button')
  // borrow styles from yt
  backToTopButton.className =
    'bt-btt-btn yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m'
  backToTopButton.innerHTML = TO_TOP_BUTTON_HTML

  const hideMiniplayerButton = document.createElement('button')
  hideMiniplayerButton.className =
    'bt-hide-btn yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m'
  hideMiniplayerButton.innerHTML = HIDE_BUTTON_HTML

  backToTopButton.addEventListener('click', function () {
    window.scrollTo(0, 0)
  })

  let youtubePlayer = null
  let isMiniPlayerMode = false

  // Cache the threshold calculation
  const getScrollThreshold = () => window.innerHeight - 100

  hideMiniplayerButton.addEventListener('click', function () {
    if (isMiniPlayerMode && youtubePlayer) {
      if (youtubePlayer.classList.contains('bt-miniplayer-hidden')) {
        youtubePlayer.classList.remove('bt-miniplayer-hidden')
        hideMiniplayerButton.innerHTML = HIDE_BUTTON_HTML
      } else {
        youtubePlayer.classList.add('bt-miniplayer-hidden')
        hideMiniplayerButton.innerHTML = UNHIDE_BUTTON_HTML
      }
    }
  })

  function handleScroll() {
    // Early return if we don't have a player element and can't find one
    if (!youtubePlayer) {
      youtubePlayer = document.getElementById('movie_player')
      if (!youtubePlayer) {
        console.log('hiding miniplayer: youtube player not found')
        window.removeEventListener('scroll', throttledScrollHandler, {
          passive: true,
        })
        return
      }
    }

    const scrollY = window.scrollY
    const threshold = getScrollThreshold()

    // check if scrolled past the bottom of the youtube player
    if (scrollY > threshold) {
      // if so, enable miniplayer mode
      if (!isMiniPlayerMode) {
        youtubePlayer.appendChild(backToTopButton)
        youtubePlayer.appendChild(hideMiniplayerButton)
        youtubePlayer.classList.add('bt-miniplayer', 'ytp-small-mode')
        window.dispatchEvent(new Event('resize'))
        isMiniPlayerMode = true
      }
    } else {
      // if not, disable miniplayer mode
      if (isMiniPlayerMode) {
        youtubePlayer.classList.remove('bt-miniplayer', 'ytp-small-mode')
        window.dispatchEvent(new Event('resize'))
        isMiniPlayerMode = false
      }
    }
  }

  // Create throttled scroll handler with trailing debounce
  const throttledScrollHandler = throttleWithTrailingDebounce(
    handleScroll,
    MP_SCROLL_THROTTLE_DELAY, // throttle delay: 160ms
    50 // debounce delay: 50ms to catch final position
  )

  window.addEventListener('scroll', throttledScrollHandler, { passive: true })
})
