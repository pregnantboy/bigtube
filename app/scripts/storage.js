export async function getStorageByKey(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? true)
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
