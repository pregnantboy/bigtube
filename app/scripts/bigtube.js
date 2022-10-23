function setTheatreModeCookie(value) {
  chrome.cookies.set({
    url: 'https://www.youtube.com',
    name: 'wide',
    value: value ? '1' : '0',
    expirationDate: Math.round(Date.now() / 1000) + 365 * 24 * 60 * 60,
  })
}

const BIGTUBE_CONTENT_SCRIPT_ID = 'bigtube-content-script'
const bigtubeContentScript = {
  id: BIGTUBE_CONTENT_SCRIPT_ID,
  allFrames: true,
  css: ['./styles/bigtube.css'],
  matches: ['https://www.youtube.com/*'],
  persistAcrossSessions: true,
  runAt: 'document_start',
}

async function registerBigtube() {
  return new Promise((resolve) => {
    setTheatreModeCookie(true)
    chrome.scripting.registerContentScripts([bigtubeContentScript], resolve)
  })
}

async function isBigtubeRegistered() {
  return new Promise((resolve) => {
    chrome.scripting.getRegisteredContentScripts(
      {
        ids: [BIGTUBE_CONTENT_SCRIPT_ID],
      },
      (registeredScripts) => {
        resolve(
          registeredScripts.some(
            (script) => script.id === BIGTUBE_CONTENT_SCRIPT_ID
          )
        )
      }
    )
  })
}

function unregisterBigtube() {
  return new Promise((resolve) => {
    chrome.scripting.unregisterContentScripts(
      {
        ids: [BIGTUBE_CONTENT_SCRIPT_ID],
      },
      resolve
    )
  })
}

export { registerBigtube, unregisterBigtube, isBigtubeRegistered }
