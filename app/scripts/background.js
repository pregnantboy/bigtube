'use strict';

var css = `
.bigtube video.video-stream.html5-main-video {
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0px;
}

.bigtube ytd-watch[theater] #player.ytd-watch {
  height: calc(100vh - 56px);
  max-height: calc(100vh - 56px);
}

.bigtube .watch-stage-mode #watch-appbar-playlist {
  margin-top: calc(100vh - 480px);
}

@media screen and (min-height: 870px) and (min-width: 1320px) {
  .bigtube .watch-stage-mode #watch-appbar-playlist {
    margin-top: calc( 100vh - 720px);
  }
}`;

var reloadCode = `
                console.log('called reload for page navigation and refresh');
                if (!document.applyBigtube) {
                  document.applyBigtube = function() {
                      if( !document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater") ) {
                        document.body.classList.add('bigtube');
                        window.dispatchEvent(new Event('resize')); 
                      } else {
                        document.body.classList.remove('bigtube');
                      }
                      window.dispatchEvent(new Event('resize'));
                  } 
                }
                if (!document.changeTitle) {
                  document.changeTitle = function() {
                    if( !document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater") ) {
                      document.getElementsByClassName('ytp-size-button')[0].title = 'Bigtube mode';
                    } 
                  }
                }
                document.body.classList.add('bigtube');
                window.dispatchEvent(new Event('resize'));
                document.getElementsByClassName('ytp-size-button')[0].removeEventListener("click", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].removeEventListener("mouseover", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].addEventListener("click", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].addEventListener("mouseover", document.changeTitle);
              `;

var staticCode = `
                console.log('called static for button toggle');
                if (!document.applyBigtube) {
                  document.applyBigtube = function() {
                      if( !document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater") ) {
                        document.body.classList.add('bigtube');
                      } else {
                        document.body.classList.remove('bigtube');
                      }
                      window.dispatchEvent(new Event('resize'));
                  } 
                }
                if (!document.changeTitle) {
                  document.changeTitle = function() {
                    if( !document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater") ) {
                      document.getElementsByClassName('ytp-size-button')[0].title = 'Bigtube mode';
                    } 
                  }
                }
                if( document.getElementsByTagName('ytd-watch')[0].hasAttribute("theater")) {
                  document.body.classList.add('bigtube');
                  window.dispatchEvent(new Event('resize'));
                } else {
                  document.getElementsByClassName('ytp-size-button')[0].title = 'Bigtube mode';
                }
                document.getElementsByClassName('ytp-size-button')[0].removeEventListener("click", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].removeEventListener("mouseover", document.changeTitle);
                document.getElementsByClassName('ytp-size-button')[0].addEventListener("click", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].addEventListener("mouseover", document.changeTitle);
              `;

var returnvalue = {};

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
          console.log('called remove');
          console.log(document.applyBigtube);
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
  if (changeInfo.cookie.domain.indexOf('youtube.com') !== -1 && changeInfo.cookie.name === 'wide' && changeInfo.cookie.value !== '1') {
    getToggle(setCookie);
  }
});
