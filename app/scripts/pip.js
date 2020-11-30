"use strict";

function launchPip() {
  if (!document.pictureInPictureEnabled) {
    return;
  }

  var videos = Array.from(document.querySelectorAll("video"));

  if (!videos.length) {
    return;
  }

  if (document.body.hasAttribute("its-pipping")) {
    document.exitPictureInPicture();
    document.body.removeAttribute("its-pipping");
  }

  var video = videos[0];

  function percentageOfVideoInViewport(video) {
    var viewportHeight = window.innerHeight;
    var boundingRect = video.getBoundingClientRect();
    var elementOffsetTop = boundingRect.top;
    var elementOffsetBottom = viewportHeight - boundingRect.bottom;
    var elementHeight = boundingRect.height;

    if (elementOffsetTop <= 0) {
      if (elementOffsetTop + elementHeight <= 0) {
        return 0;
      } else {
        return Math.min(elementOffsetTop + elementHeight, viewportHeight) / Math.min(elementHeight, viewportHeight) * 100;
      }
    } else {
      if (elementOffsetTop > viewportHeight) {
        return 0;
      } else {
        return (viewportHeight - elementOffsetTop - Math.max(elementOffsetBottom, 0)) / Math.min(elementHeight, viewportHeight) * 100;
      }
    }
  }

  if (videos.length > 1) {
    videos.sort(function (a, b) {
      var difference = percentageOfVideoInViewport(b) - percentageOfVideoInViewport(a);

      if (difference !== 0) {
        return difference;
      } else {
        return b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth;
      }
    });
    video = videos[0];
  }

  if (video.disablePictureInPicture) {
    video.disablePictureInPicture = false;
  }

  try {
    video.requestPictureInPicture();
    document.body.setAttribute("its-pipping", true);
  } catch (e) {
    console.log(e);
  }
}

var isPipBrowserAction = true;
var usePipKeyboardShortcut = true;
chrome.storage.local.get([BROWSER_ACTION, PIP_SHORTCUT], function (data) {
  if (data[BROWSER_ACTION] && data[BROWSER_ACTION] !== "pip") {
    isPipBrowserAction = false;
  }

  if (data[PIP_SHORTCUT] === false) {
    usePipKeyboardShortcut = false;
  }
});
chrome.storage.onChanged.addListener(function (changes) {
  if (changes[BROWSER_ACTION]) {
    var newValue = changes[BROWSER_ACTION].newValue;
    isPipBrowserAction = newValue === 'pip' || newValue == undefined;
  }

  if (changes[PIP_SHORTCUT]) {
    var _newValue = changes[PIP_SHORTCUT].newValue;
    usePipKeyboardShortcut = _newValue !== false;
  }
});
chrome.browserAction.onClicked.addListener(function () {
  if (isPipBrowserAction) {
    chrome.tabs.executeScript({
      code: "(".concat(launchPip.toString(), ")()"),
      allFrames: true
    });
  }
});
chrome.commands.onCommand.addListener(function (command) {
  if (usePipKeyboardShortcut && command === 'toggle-pip') {
    chrome.tabs.executeScript({
      code: "(".concat(launchPip.toString(), ")()"),
      allFrames: true
    });
  }
});