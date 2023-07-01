export function setTheatreModeCookie(value) {
  try {
    chrome.cookies.set({
      url: 'https://www.youtube.com',
      name: 'wide',
      value: value ? '1' : '0',
      expirationDate: Math.round(Date.now() / 1000) + 365 * 24 * 60 * 60,
    })
  } catch (e) {
    console.error(e)
  }
}

