'use strict';

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
      getToggle(function (toggle) {
        if (toggle) {
          chrome.tabs.executeScript(tab.id, {
            code: "document.getElementById('body-container').classList.add('bigtube');",
            runAt: "document_end"
          });
          chrome.tabs.insertCSS(tab.id, {
            file: 'styles/bigtube.css'
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
  var path = (value) ? "images/Icon-38.png" : "images/Icon-disabled-38.png";
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
