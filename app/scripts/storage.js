export async function getStorageByKeys(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      const returnArray = []
      for (const key of keys) {
        returnArray.push(result[key] ?? true)
      }
      resolve(returnArray)
    })
  })
}

export async function setStorageByKey(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, (result) => {
      resolve(result)
    })
  })
}
