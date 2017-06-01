'use strict';

var css = `
.bigtube #placeholder-player .player-api.player-width.player-height {
  width: 100vw !important;
  min-width: 1003px;
  height: 100vh !important;
  max-width: 100%;
  left: -50vw;
}

.bigtube #player-mole-container #player-api {
  height: 100vh;
  width: 100vw;
  min-width: 1003px;
  max-width: 100%;
  margin-left: 50vw;
  left: -50vw;
}

.bigtube #masthead-positioner-height-offset {
  display: none;
}

.bigtube #masthead-positioner {
  opacity: 0;
  transition-duration: 0.3s;
}

.bigtube #watch-appbar-playlist {
  margin-top: calc( 100vh - 480px);
}

@media screen and (min-height: 870px) and (min-width: 1320px) {
  .bigtube #watch-appbar-playlist {
    margin-top: calc( 100vh - 720px);
  }
}

#masthead-positioner:hover {
  opacity: 1;
}`;

function setCookie(value) {
  if (!value) {
    return;
  }
  chrome.cookies.set({
    url: 'https://www.youtube.com',
    name: 'wide',
    value: '1'
  });
}

function getToggle(callback) { // expects function(value){...}
  chrome.storage.local.get('toggle', function (data) {
    if (data.toggle === undefined) {
      callback(true); // default value
    } else {
      callback(data.toggle);
    }
  });
}

function setToggle(value, callback) { // expects function(){...}
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


function insertYoutubeCSS(tab) {
  if (tab.url && tab.url.match(/^http?s\:\/\/(www\.)?youtube\.com/)) {
    if (tab.url.match(/^http?s\:\/\/(www\.)?youtube\.com\/watch\?/)) {
      chrome.tabs.insertCSS(tab.id, {
        code: css
      });
      getToggle(function (toggle) {
        if (toggle) {
          chrome.tabs.executeScript(tab.id, {
            code: "document.getElementById('body-container').classList.add('bigtube');",
            runAt: "document_end"
          });
        }
      });
    } else {
      chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('body-container').classList.remove('bigtube');",
        runAt: "document_end"
      });
    }
  }
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
      setCookie();
      chrome.cookies.get({
        url: 'https://www.youtube.com',
        name: 'wide'
      }, function (cookie) {
        console.log(cookie);
      });
      chrome.tabs.getSelected(null, function (tab) {
        if (tab.url && tab.url.match(/^http?s\:\/\/(www\.)?youtube\.com\/watch\?/)) {
          chrome.tabs.reload(tab.id);
        }
      });
    });
  });
});

// chrome.webNavigation.onCommitted.addListener(insertYoutubeCSS);

chrome.cookies.onChanged.addListener(function (changeInfo) {
  if (changeInfo.cookie.domain.indexOf('youtube.com') !== -1 && changeInfo.cookie.name === 'wide' && changeInfo.cookie.value !== '1') {
    getToggle(setCookie);
  }
});

// chrome.tabs.onCreated.addListener(insertYoutubeCSS);

// chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
//   if (tab.url && info.status == "complete") {
//     alert(tab.url);
//     insertYoutubeCSS(tab);
//   }
// });

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.frameId === 0) {
    // Fires only when details.url === currentTab.url
    chrome.tabs.get(details.tabId, function (tab) {
      if (tab.url === details.url) {
        insertYoutubeCSS(tab);
      }
    });
  }
});