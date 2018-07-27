'use strict';

var css = `
@media (min-width: 857px) {
  .bigtube .watch-stage-mode #watch-appbar-playlist {
    margin-top: calc(100vh - 480px);
  }
}

@media (min-width: 882px) {
  .bigtube ytd-watch:not([fullscreen])[theater] #player.ytd-watch {
    height: calc(100vh - 56px);
    max-height: calc(100vh - 56px);
  }
}

@media screen and (min-height: 870px) and (min-width: 1320px) {
  .bigtube .watch-stage-mode #watch-appbar-playlist {
    margin-top: calc( 100vh - 720px);
  }
}`;

var declareFunctions = `
  if (!document.applyBigtube) {
    document.applyBigtube = function() {
      document.body.classList.add('bigtube');
      window.dispatchEvent(new Event('resize'));
    }
  }
  if (!document.changeTitle) {
    document.changeTitle = function() {
      if( !document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater") ) {
        document.getElementsByClassName('ytp-size-button')[0].title = 'Bigtube!';
      } 
    }
  }
`;

var setEventListeners = `
  document.getElementsByClassName('ytp-size-button')[0].removeEventListener("click", document.applyBigtube);
  document.getElementsByClassName('ytp-size-button')[0].removeEventListener("mouseover", document.applyBigtube);
  document.getElementsByClassName('ytp-size-button')[0].addEventListener("click", document.applyBigtube);
  document.getElementsByClassName('ytp-size-button')[0].addEventListener("mouseover", document.changeTitle);
`;

var reloadCode = `
                console.log('Enabling bigtube for page navigation and refresh');
                ${declareFunctions}
                document.applyBigtube();
                ${setEventListeners}
              `;

var staticCode = `
                console.log('Enabling bigtube for button toggle');
                ${declareFunctions}
                if( document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater")) {
                  document.applyBigtube();
                } else {
                  document.changeTitle();
                }
                ${setEventListeners}
              `;

var returnvalue = {};

function setCookie(value) {
  chrome.cookies.set({
    url: 'https://www.youtube.com',
    name: 'wide',
    value: value ? '1' : '0',
    expirationDate: Math.round(Date.now() / 1000) + (365 * 24 * 60 * 60)
  });
}

function getToggle(callback) {
  chrome.storage.local.get('toggle', function (data) {
    if (data.toggle === undefined) {
      callback(true); // default value
    } else {
      callback(data.toggle);
    }
  });
}

function setToggle(value, callback) {
  chrome.storage.local.set({
    toggle: value
  }, function (t) {
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
  if (!isYoutubeVideo(tab)) {
    return;
  }
  getToggle(function (toggle) {
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
          if( !document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater") ) {
            document.getElementsByClassName('ytp-size-button')[0].title = 'Cinema mode';            
          }
          window.dispatchEvent(new Event('resize'));
          `,
    runAt: "document_idle"
  });
}

function setIcon(value) {
  var path = (value) ? "images/icon-38.png" : "images/icon-disabled-38.png";
  chrome.browserAction.setIcon({
    path: path
  });
}

getToggle(setIcon); // Initial state
getToggle(setCookie);

chrome.browserAction.onClicked.addListener(function (tab) {
  getToggle(function (toggle) {
    setToggle(!toggle, function () {
      setIcon(!toggle);
      setCookie(!toggle);
      insertYoutubeCSS(tab, true);
    });
  });
});

// for refresh
chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, function (tab) {
      if (tab.url === details.url) {
        insertYoutubeCSS(tab, false);
      }
    });
  };
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, function (tab) {
      if (tab.url === details.url) {
        insertYoutubeCSS(tab, false);
      }
    });
  }
});

chrome.cookies.onChanged.addListener(function (changeInfo) {
  // deprecated for now
  // if (changeInfo.cookie.domain.indexOf('youtube.com') !== -1 && changeInfo.cookie.name === 'wide' && changeInfo.cookie.value !== '1') {
  //   getToggle(setCookie);
  // }
});
