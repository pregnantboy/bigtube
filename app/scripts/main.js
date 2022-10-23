import {
  registerBigtube,
  unregisterBigtube,
  isBigtubeRegistered,
} from './bigtube.js'
import { ENABLE_BIGTUBE } from './constants.js'
import { getStorageByKey } from './storage.js'

async function init() {
  const isBigtubeEnabled = await getStorageByKey(ENABLE_BIGTUBE)
  const isRegistered = await isBigtubeRegistered()
  if (isBigtubeEnabled && !isRegistered) {
    await registerBigtube()
  } else if (!isBigtubeEnabled && isRegistered) {
    unregisterBigtube()
  }
}

chrome.storage.onChanged.addListener(init)

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['scripts/pip.js'],
  })
})

init()
