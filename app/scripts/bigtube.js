'use strict';

const css = `
@media (min-width: 857px) {
  .bigtube .watch-stage-mode #watch-appbar-playlist {
    margin-top: calc(100vh - 480px);
  }
}

@media (min-width: 882px) {
  .bigtube ytd-watch:not([fullscreen])[theater] #player.ytd-watch, 
  .bigtube ytd-watch-flexy:not([fullscreen])[theater] #player-theater-container.ytd-watch-flexy {
    height: calc(100vh - 56px);
    max-height: calc(100vh - 56px);
  }
}

@media screen and (min-height: 870px) and (min-width: 1320px) {
  .bigtube .watch-stage-mode #watch-appbar-playlist {
    margin-top: calc( 100vh - 720px);
  }
}`;

// theater-requested_

const applyBigtube = `
  document.querySelector('ytd-app').classList.add('bigtube');
  window.dispatchEvent(new Event('resize'));
`;

const changeBigtubeTitle = `
  if (!window.changeBigtubeTitle) {
    window.changeBigtubeTitle = function() {
      let newTitle = document.getElementsByClassName('ytp-size-button')[0].title.replace('Cinema', 'Bigtube');
      document.getElementsByClassName('ytp-size-button')[0].title = newTitle;
    }
  }
  window.changeBigtubeTitle();
  document.querySelector('ytd-app').removeEventListener('yt-set-theater-mode-enabled', window.changeBigtubeTitle);
  document.querySelector('ytd-app').addEventListener('yt-set-theater-mode-enabled', window.changeBigtubeTitle);
`;

const code = `
                console.log('Applying Bigtube')
                ${applyBigtube}
                ${changeBigtubeTitle}
              `;

function setCookie(value) {
  chrome.cookies.set({
    url: 'https://www.youtube.com',
    name: 'wide',
    value: value ? '1' : '0',
    expirationDate: Math.round(Date.now() / 1000) + (365 * 24 * 60 * 60)
  });
}

let isBigtubeEnabled = true;
let isBigtubeBrowserAction = false;

chrome.storage.local.get([ENABLE_BIGTUBE, BROWSER_ACTION], (data) => {
  if (data[ENABLE_BIGTUBE] != undefined) {
    isBigtubeEnabled = data[ENABLE_BIGTUBE];
  }
  if (data[BROWSER_ACTION] != undefined) {
    isBigtubeBrowserAction = data[BROWSER_ACTION] === 'bigtube'
  }
});

function setToggle(value, callback) {
  const newValue = {};
  newValue[ENABLE_BIGTUBE] = value;
  chrome.storage.local.set(newValue, (t) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      callback();
    }
  });
}

function insertYoutubeCSS(tab) {
  if (isBigtubeEnabled) {
    chrome.tabs.insertCSS(tab.id, {
      code: css
    });
    chrome.tabs.executeScript(tab.id, {
      code,
      runAt: "document_idle"
    });
  } else {
    removeYoutubeCSS(tab);
  }
}

function removeYoutubeCSS(tab) {
  chrome.tabs.executeScript(tab.id, {
    code: `
          console.log('Disabling bigtube');
          document.querySelector('ytd-app').classList.remove('bigtube');
          window.dispatchEvent(new Event('resize'));
          if (window.changeBigtubeTitle) {
            document.querySelector('ytd-app').removeEventListener('yt-set-theater-mode-enabled', window.changeBigtubeTitle);
          }
          document.getElementsByClassName('ytp-size-button')[0].title = document.getElementsByClassName('ytp-size-button')[0].title.replace('Bigtube', 'Cinema');
          `,
    runAt: "document_idle"
  });
}

function setIcon(value) {
  const path = value ? "images/icon-38.png" : "images/icon-disabled-38.png";
  chrome.browserAction.setIcon({
    path: path
  });
}

setIcon(isBigtubeEnabled); // Initial state
setCookie(isBigtubeEnabled);


chrome.browserAction.onClicked.addListener((tab) => {
  if (!isBigtubeBrowserAction) {
    return;
  }
  console.log('bigtube', isBigtubeEnabled)
  isBigtubeEnabled = !isBigtubeEnabled;
  setToggle(isBigtubeEnabled, () => {
    setIcon(isBigtubeEnabled);
    setCookie(isBigtubeEnabled);
    insertYoutubeCSS(tab);
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes[ENABLE_BIGTUBE]) {
    isBigtubeEnabled = changes[ENABLE_BIGTUBE].newValue
    setIcon(isBigtubeEnabled);
    setCookie(isBigtubeEnabled);
  }
  if (changes[BROWSER_ACTION]) {
    isBigtubeBrowserAction = changes[BROWSER_ACTION].newValue === 'bigtube';
  }
});

// for refresh
chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  if (!isBigtubeEnabled) {
    return;
  }
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      insertYoutubeCSS(tab);
    });
  };
}, {
    url: [
      { hostSuffix: '.youtube.com' }
    ]
  });

// // For navigation
// chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
//   if (!isBigtubeEnabled) {
//     return;
//   }
//   if (details.frameId === 0) {
//     chrome.tabs.get(details.tabId, (tab) => {
//       if (tab.url === details.url) {
//         insertYoutubeCSS(tab, false);
//       }
//     });
//   }
// });
