const bigtubeEnable = document.getElementById('bigtube-enable')
const miniplayerEnable = document.getElementById('miniplayer-enable')
const topbarHoverEnable = document.getElementById('topbar-hover-enable')

import {
  ENABLE_BIGTUBE,
  ENABLE_MINIPLAYER,
  ENABLE_TOPBAR_HOVER,
} from '../scripts/constants.js'
import { getStorageByKeys, setStorageByKey } from '../scripts/storage.js'

getStorageByKeys([ENABLE_BIGTUBE, ENABLE_MINIPLAYER, ENABLE_TOPBAR_HOVER]).then(
  ([isBigtubeEnabled, isMiniplayerEnabled, isTopbarHoverEnabled]) => {
    bigtubeEnable.checked = isBigtubeEnabled
    miniplayerEnable.checked = isMiniplayerEnabled
    topbarHoverEnable.checked = isTopbarHoverEnabled
    topbarHoverEnable.disabled = !isBigtubeEnabled
  }
)

bigtubeEnable.onchange = (e) => {
  setStorageByKey(ENABLE_BIGTUBE, e.target.checked)
  topbarHoverEnable.disabled = !e.target.checked
  if (!e.target.checked) {
    topbarHoverEnable.checked = false
    setStorageByKey(ENABLE_TOPBAR_HOVER, false)
  }
}

miniplayerEnable.onchange = (e) => {
  setStorageByKey(ENABLE_MINIPLAYER, e.target.checked)
}

topbarHoverEnable.onchange = (e) => {
  setStorageByKey(ENABLE_TOPBAR_HOVER, e.target.checked)
}
