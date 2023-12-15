const HIDE_BUTTON_HTML =
  'Hide <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 20px; height: 20px; fill: white; margin-right: -14px"><path d="m9.4 18.4-.7-.7 5.6-5.6-5.7-5.7.7-.7 6.4 6.4-6.3 6.3z"></path></svg>'

const UNHIDE_BUTTON_HTML =
  'Show <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 20px; height: 20px; fill: white; margin-right: -14px; transform: rotate(-90deg);"><path d="m9.4 18.4-.7-.7 5.6-5.6-5.7-5.7.7-.7 6.4 6.4-6.3 6.3z"></path></svg>'

window.addEventListener('load', function () {
  const backToTopButton = document.createElement('button')
  // borrow styles from yt
  backToTopButton.className =
    'bt-btt-btn yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m'
  backToTopButton.innerText = 'Back to Top'

  const hideMiniplayerButton = document.createElement('button')
  hideMiniplayerButton.className =
    'bt-hide-btn yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m'
  hideMiniplayerButton.innerHTML = HIDE_BUTTON_HTML

  backToTopButton.addEventListener('click', function () {
    window.scrollTo(0, 0)
  })

  let youtubePlayer = null
  let isMiniPlayerMode = false

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

  window.addEventListener(
    'scroll',
    function () {
      // check if scrolled past the bottom of the youtube player
      if (window.scrollY > window.innerHeight - 100) {
        // if so, enable miniplayer mode
        if (!isMiniPlayerMode) {
          youtubePlayer =
            youtubePlayer ?? document.getElementById('movie_player')
          if (!youtubePlayer) {
            window.removeEventListener('scroll', arguments.callee)
            console.log('hiding miniplayer: youtube player not found')
            return
          }
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
    },
    false
  )
})
