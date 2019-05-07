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

const declareFunctions = `
  if (!document.applyBigtube) {
    document.applyBigtube = function() {
      document.body.classList.add('bigtube');
      window.dispatchEvent(new Event('resize'));
    }
  }
  if (!document.changeTitle) {
    document.changeTitle = function() {
      if( document.getElementsByClassName('ytp-size-button')[0].title === 'Cinema mode') {
        document.getElementsByClassName('ytp-size-button')[0].title = 'Bigtube!';
      } 
    }
  }
`;

const setEventListeners = `
  document.getElementsByClassName('ytp-size-button')[0].removeEventListener("click", document.applyBigtube);
  document.getElementsByClassName('ytp-size-button')[0].removeEventListener("mouseover", document.applyBigtube);
  document.getElementsByClassName('ytp-size-button')[0].addEventListener("click", document.applyBigtube);
  document.getElementsByClassName('ytp-size-button')[0].addEventListener("mouseover", document.changeTitle);
`;

const reloadCode = `
                console.log('Enabling bigtube for page navigation and refresh');
                ${declareFunctions}
                document.applyBigtube();
                ${setEventListeners}
              `;

const staticCode = `
                console.log('Enabling bigtube for button toggle');
                ${declareFunctions}
                document.applyBigtube();
                document.changeTitle();
                ${setEventListeners}
              `;

function setCookie(value) {
  chrome.cookies.set({
    url: 'https://www.youtube.com',
    name: 'wide',
    value: value ? '1' : '0',
    expirationDate: Math.round(Date.now() / 1000) + (365 * 24 * 60 * 60)
  });
}

function getToggle(callback) {
  chrome.storage.local.get(ENABLE_BIGTUBE, (data) => {
    if (data[ENABLE_BIGTUBE] == undefined) {
      callback(true); // default value
    } else {
      callback(data[ENABLE_BIGTUBE]);
    }
  });
}

function setToggle(value, callback) {
  const newValue = {}
  newValue[ENABLE_BIGTUBE] = value
  chrome.storage.local.set(newValue, (t) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      callback();
    }
  });
}

function isYoutubeVideo(tab) {
  if (tab.url.match(/^http?s\:\/\/(www\.)?youtube\.com\/watch\?/)) {
    return true;
  } else {
    chrome.tabs.executeScript(tab.id, {
      code: "document.body.classList.remove('bigtube');"
    });
    return false;
  }
}

function insertYoutubeCSS(tab, check) {
  console.log("isyoutube", isYoutubeVideo(tab));
  if (!isYoutubeVideo(tab)) {
    return;
  }
  getToggle(function (toggle) {
    console.log(toggle)
    if (toggle) {
      chrome.tabs.insertCSS(tab.id, {
        code: css
      });
      console.log('executing ', check ? 'static code' : 'reload code ');
      chrome.tabs.executeScript(tab.id, {
        code: check ? staticCode : reloadCode,
        runAt: "document_idle"
      });
    } else {
      removeYoutubeCSS(tab);
    }
  });
}

function removeYoutubeCSS(tab) {
  chrome.tabs.executeScript(tab.id, {
    code: `
          console.log('Disabling bigtube');
          document.getElementsByClassName('ytp-size-button')[0].removeEventListener("click", document.applyBigtube);
          document.getElementsByClassName('ytp-size-button')[0].removeEventListener("mouseover", document.changeTitle);
          document.body.classList.remove('bigtube');
          if( document.getElementsByClassName('ytp-size-button')[0].title === 'Bigtube!' ) {
            document.getElementsByClassName('ytp-size-button')[0].title = 'Cinema mode';            
          }
          window.dispatchEvent(new Event('resize'));
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

getToggle(setIcon); // Initial state
getToggle(setCookie);

function isBigtubeBrowserAction(callback) {
  chrome.storage.local.get(BROWSER_ACTION, function (data) {
    if (data[BROWSER_ACTION] === "bigtube") {
      callback()
    }
  })
}

chrome.browserAction.onClicked.addListener((tab) => {
  isBigtubeBrowserAction(() => {
    getToggle((toggle) => {
      setToggle(!toggle, () => {
        setIcon(!toggle);
        setCookie(!toggle);
        insertYoutubeCSS(tab, true);
      });
    });
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes[ENABLE_BIGTUBE]) {
    const toggle = changes[ENABLE_BIGTUBE].newValue
    setIcon(toggle);
    setCookie(toggle);
  }
});



// for refresh
chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      if (tab.url === details.url) {
        insertYoutubeCSS(tab, false);
      }
    });
  };
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      if (tab.url === details.url) {
        insertYoutubeCSS(tab, false);
      }
    });
  }
});
