const pipButton = document.getElementById('pip-button')
const bigtubeButton = document.getElementById('bigtube-button')
const bigtubeEnable = document.getElementById('bigtube-enable')
const pipShortcut = document.getElementById('pip-shortcut')
const twitchWhispers = document.getElementById('twitch-whispers')
const saveButton = document.getElementsByClassName('save-button')[0]
chrome.storage.local.get(
  [BROWSER_ACTION, ENABLE_BIGTUBE, PIP_SHORTCUT, TWITCH_WHISPERS],
  (data) => {
    if (!data[BROWSER_ACTION] || data[BROWSER_ACTION] === 'pip') {
      pipButton.checked = true
    } else {
      bigtubeButton.checked = true
    }

    if (data[ENABLE_BIGTUBE] == undefined || data[ENABLE_BIGTUBE]) {
      bigtubeEnable.checked = true
    }

    if (data[PIP_SHORTCUT] == undefined || data[PIP_SHORTCUT]) {
      pipShortcut.checked = true
    }

    if (data[TWITCH_WHISPERS] == undefined || data[TWITCH_WHISPERS]) {
      twitchWhispers.checked = true
    }
  }
)

saveButton.onclick = () => {
  const newData = {}
  newData[BROWSER_ACTION] = pipButton.checked ? 'pip' : 'bigtube'
  newData[ENABLE_BIGTUBE] = bigtubeEnable.checked
  newData[PIP_SHORTCUT] = pipShortcut.checked
  newData[TWITCH_WHISPERS] = twitchWhispers.checked
  chrome.storage.local.set(newData, () => {
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      window.close()
    }
  })
}
