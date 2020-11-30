const twitchCss = `
    .video-player__container--theatre-whispers {
       bottom: 0 !important
    }

    .video-player--theatre-whispers.video-player--logged-in .video-player__container {
        bottom: 0 !important;
    }

    .whispers--theatre-mode {
        z-index: -1 !important;
    }
`

let isTwitchEnabled = true

chrome.storage.local.get(TWITCH_WHISPERS, (data) => {
  if (data[TWITCH_WHISPERS] === false) {
    isTwitchEnabled = false
  }
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes[TWITCH_WHISPERS]) {
    isTwitchEnabled = changes[TWITCH_WHISPERS].newValue
  }
})

chrome.webNavigation.onDOMContentLoaded.addListener(
  (details) => {
    console.log('hide twitch whispers?', isTwitchEnabled)
    if (isTwitchEnabled) {
      chrome.tabs.insertCSS(details.tabId, {
        code: twitchCss,
      })
    }
  },
  { url: [{ hostSuffix: '.twitch.tv' }] }
)
