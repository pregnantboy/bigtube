window.addEventListener('load', function () {
  const backToTopButton = document.createElement('button')
  // borrow styles from yt
  backToTopButton.className = "bt-btt-btn yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m"
  backToTopButton.innerText = "Back to Top"

  backToTopButton.addEventListener('click', function () {
    window.scrollTo(0, 0)
  })

  let youtubePlayer = null
  let youtubePlayerContainer = null
  let oldYoutubePlayerContainerParent = null
  let playerWideContainer = null
  let isMiniPlayerMode = false

  window.addEventListener('scroll', function () {
    // check if scrolled past the bottom of the youtube player
    if (window.scrollY > window.innerHeight - 100) {
      // if so, enable miniplayer mode
      if (!isMiniPlayerMode) {
        youtubePlayer = youtubePlayer ?? document.getElementById('movie_player')
        if (!youtubePlayer) {
          console.log('hi')
          this.window.removeEventListener('scroll', arguments.callee)
          console.log('hide miniplayer: youtube player not found')
          return
        }
        youtubePlayer.appendChild(backToTopButton)
        youtubePlayerContainer = youtubePlayerContainer ?? this.document.getElementById('player-container')
        oldYoutubePlayerContainerParent = youtubePlayerContainer.parentElement
        if (oldYoutubePlayerContainerParent.id !== 'player-wide-container') {
          playerWideContainer = playerWideContainer ?? this.document.getElementById('player-wide-container')
          playerWideContainer.appendChild(youtubePlayerContainer)
        }
        youtubePlayer.classList.add('bt-miniplayer', 'ytp-small-mode')
        youtubePlayer.classList.remove('ytp-large-width-mode')
        window.dispatchEvent(new Event('resize'))
        isMiniPlayerMode = true
      }
    } else {
      // if not, disable miniplayer mode
      if (isMiniPlayerMode) {
        oldYoutubePlayerContainerParent.appendChild(youtubePlayerContainer)
        youtubePlayer.classList.remove('bt-miniplayer', 'ytp-small-mode')
        window.dispatchEvent(new Event('resize'))
        isMiniPlayerMode = false
      }
    }
  }, false)

  // window.addEventListener('resize', function () {
  //   if (isMiniPlayerMode) {
  //     if (oldYoutubePlayerContainerParent.id !== 'cinematics-wide-container') {
  //       cinematicsWideContainer = cinematicsWideContainer ?? this.document.getElementById('cinematics-wide-container')
  //       cinematicsWideContainer.appendChild(youtubePlayerContainer)
  //     }
  //   }
  // }, false)
})


