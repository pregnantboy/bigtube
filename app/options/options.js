const bigtubeEnable = document.getElementById('bigtube-enable')

import { ENABLE_BIGTUBE } from '../scripts/constants.js'
import { getStorageByKey, setStorageByKey } from '../scripts/storage.js'

getStorageByKey(ENABLE_BIGTUBE).then((isBigtubeEnabled) => {
  bigtubeEnable.checked = isBigtubeEnabled
})

bigtubeEnable.onchange = (e) => {
  setStorageByKey(ENABLE_BIGTUBE, e.target.checked)
}
