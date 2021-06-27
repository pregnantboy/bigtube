const pipButton = document.getElementById('pip-button')
const bigtubeButton = document.getElementById('bigtube-button')
const theatreButton = document.getElementById('theatre-button')
const bigtubeEnable = document.getElementById('bigtube-enable')
const pipShortcut = document.getElementById('pip-shortcut')
const saveButton = document.getElementById('save-button')

chrome.storage.local.get(
  [BROWSER_ACTION, ENABLE_BIGTUBE, PIP_SHORTCUT],
  (data) => {
    switch (data[BROWSER_ACTION]) {
      case 'bigtube':
        bigtubeButton.checked = true
        break
      case 'theatre':
        theatreButton.checked = true
        break
      case 'pip':
      default:
        pipButton.checked = true
    }

    if (data[ENABLE_BIGTUBE] == undefined || data[ENABLE_BIGTUBE]) {
      bigtubeEnable.checked = true
    }

    if (data[PIP_SHORTCUT] == undefined || data[PIP_SHORTCUT]) {
      pipShortcut.checked = true
    }
  }
)

saveButton.onclick = () => {
  const newData = {}
  newData[BROWSER_ACTION] = bigtubeButton.checked
    ? 'bigtube'
    : theatreButton.checked
    ? 'theatre'
    : 'pip'
  newData[ENABLE_BIGTUBE] = bigtubeEnable.checked
  newData[PIP_SHORTCUT] = pipShortcut.checked
  chrome.storage.local.set(newData, () => {
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      window.close()
    }
  })
}
