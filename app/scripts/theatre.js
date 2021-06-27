let isTheatreBrowserAction = true
let useTheatreKeyboardShortcut = true

chrome.storage.local.get([BROWSER_ACTION, THEATRE_SHORTCUT], (data) => {
  if (data[THEATRE_SHORTCUT] === false) {
    useTheatreKeyboardShortcut = false
  }
  if (data[BROWSER_ACTION] != undefined) {
    isTheatreBrowserAction = data[BROWSER_ACTION] === 'theatre'
  }
})

chrome.commands.onCommand.addListener(function (command) {
  if (useTheatreKeyboardShortcut && command === 'toggle-theatre') {
    chrome.tabs.executeScript({
      code: `(${toggleTheatreMode.toString()})()`,
      allFrames: true,
    })
  }
})

chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.insertCSS({
    code: theatreCSS,
    allFrames: true,
  })
  if (isTheatreBrowserAction) {
    chrome.tabs.executeScript({
      code: `(${toggleTheatreMode.toString()})()`,
      allFrames: true,
    })
  }
})

const theatreCSS = `
    video.bigtube-theatre {
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: black !important;
      z-index: 99999999999999999 !important;
    }
`

function toggleTheatreMode() {
  const videos = Array.from(document.querySelectorAll('video'))
  if (!videos.length) {
    return
  }

  const BIGTUBE_THEATRE_CLASS = 'bigtube-theatre'

  const currentTheatreEls = document.querySelectorAll(
    '.' + BIGTUBE_THEATRE_CLASS
  )
  const isTheatreModeActive = currentTheatreEls.length > 0
  // Removes all
  currentTheatreEls.forEach((el) => {
    if (el.classList.contains(BIGTUBE_THEATRE_CLASS)) {
      el.classList.remove(BIGTUBE_THEATRE_CLASS)
    }
  })

  if (isTheatreModeActive) {
    return
  }

  let video = videos[0]

  function percentageOfVideoInViewport(video) {
    const viewportHeight = window.innerHeight
    const boundingRect = video.getBoundingClientRect()
    const elementOffsetTop = boundingRect.top
    const elementOffsetBottom = viewportHeight - boundingRect.bottom
    const elementHeight = boundingRect.height

    if (elementOffsetTop <= 0) {
      // element begins before start of viewport
      if (elementOffsetTop + elementHeight <= 0) {
        // element is completely above viewport
        return 0
      } else {
        // element is partially above viewport
        // return 100 if partial video takes up entire screen
        return (
          (Math.min(elementOffsetTop + elementHeight, viewportHeight) /
            Math.min(elementHeight, viewportHeight)) *
          100
        )
      }
    } else {
      // element begins after start of viewport
      if (elementOffsetTop > viewportHeight) {
        // element begins after end of viewport
        return 0
      } else {
        // element starts somewhere in the viewport
        return (
          ((viewportHeight -
            elementOffsetTop -
            Math.max(elementOffsetBottom, 0)) /
            Math.min(elementHeight, viewportHeight)) *
          100
        )
      }
    }
  }

  if (videos.length > 1) {
    videos.sort((a, b) => {
      // sort according to percentage in viewport
      var difference =
        percentageOfVideoInViewport(b) - percentageOfVideoInViewport(a)
      if (difference !== 0) {
        return difference
      } else {
        // if equal visibility, sort according to size
        return b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth
      }
    })
    video = videos[0]
  }

  let currEl = video
  while (currEl.parentElement) {
    if (currEl.tagName === 'IFRAME') {
      alert('iframe!')
      currEl.classList.toggle(BIGTUBE_THEATRE_CLASS)
      return
    }
    currEl = currEl.parentElement
  }
  video.classList.toggle(BIGTUBE_THEATRE_CLASS)
}
