const bigtubeEnable = document.getElementById('bigtube-enable')
const miniplayerEnable = document.getElementById('miniplayer-enable')

import { ENABLE_BIGTUBE, ENABLE_MINIPLAYER } from '../scripts/constants.js'
import { getStorageByKeys, setStorageByKey } from '../scripts/storage.js'

getStorageByKeys([ENABLE_BIGTUBE, ENABLE_MINIPLAYER]).then(([isBigtubeEnabled, isMiniplayerEnabled]) => {
  bigtubeEnable.checked = isBigtubeEnabled
  miniplayerEnable.checked = isMiniplayerEnabled
})

bigtubeEnable.onchange = (e) => {
  setStorageByKey(ENABLE_BIGTUBE, e.target.checked)
}

miniplayerEnable.onchange = (e) => {
  setStorageByKey(ENABLE_MINIPLAYER, e.target.checked)
}
