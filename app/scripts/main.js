import { setTheatreModeCookie, removeTheatreModeCookie } from './bigtube.js'
import {
  BIGTUBE_CONTENT_SCRIPT_ID,
  MINIPLAYER_CONTENT_SCRIPT_ID,
  ENABLE_BIGTUBE,
  ENABLE_MINIPLAYER,
} from './constants.js'
import { getStorageByKeys } from './storage.js'

const BIGTUBE_SCRIPT = {
  id: BIGTUBE_CONTENT_SCRIPT_ID,
  allFrames: true,
  css: ['./styles/bigtube.css'],
  matches: ['https://www.youtube.com/*'],
  persistAcrossSessions: true,
  runAt: 'document_start',
}

const MINIPLAYER_SCRIPT = {
  id: MINIPLAYER_CONTENT_SCRIPT_ID,
  allFrames: true,
  js: ['./scripts/miniplayer.js'],
  css: ['./styles/miniplayer.css'],
  matches: ['https://www.youtube.com/*'],
  runAt: 'document_start',
}

async function registerScript(script) {
  return new Promise((resolve) => {
    chrome.scripting.registerContentScripts([script], resolve)
  })
}

async function isScriptRegistered(scriptId) {
  return new Promise((resolve) => {
    chrome.scripting.getRegisteredContentScripts(
      {
        ids: [scriptId],
      },
      (registeredScripts) => {
        resolve(registeredScripts.some((s) => s.id === scriptId))
      }
    )
  })
}

async function unregisterScript(scriptId) {
  return new Promise((resolve) => {
    chrome.scripting.unregisterContentScripts(
      {
        ids: [scriptId],
      },
      resolve
    )
  })
}

async function init() {
  const [isBigtubeEnabled, isMiniplayerEnabled] = await getStorageByKeys([
    ENABLE_BIGTUBE,
    ENABLE_MINIPLAYER,
  ])

  // Bigtube
  const isBigtubeRegistered = await isScriptRegistered(
    BIGTUBE_CONTENT_SCRIPT_ID
  )
  if (isBigtubeEnabled && !isBigtubeRegistered) {
    setTheatreModeCookie(true)
    await registerScript(BIGTUBE_SCRIPT)
  } else if (!isBigtubeEnabled && isBigtubeRegistered) {
    removeTheatreModeCookie()
    await unregisterScript(BIGTUBE_CONTENT_SCRIPT_ID)
  }

  // Miniplayer
  const isMiniplayerRegistered = await isScriptRegistered(
    MINIPLAYER_CONTENT_SCRIPT_ID
  )
  if (isMiniplayerEnabled && !isMiniplayerRegistered) {
    await registerScript(MINIPLAYER_SCRIPT)
  } else if (!isMiniplayerEnabled && isMiniplayerRegistered) {
    await unregisterScript(MINIPLAYER_CONTENT_SCRIPT_ID)
  }
}

chrome.storage.onChanged.addListener(init)

chrome.action.onClicked.addListener((tab) => {
  // check if active tab is a website
  if (!tab.url?.startsWith('http')) {
    return
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['scripts/pip.js'],
  })
})

init()
