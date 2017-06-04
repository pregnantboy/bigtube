'use strict';

var css = `
.bigtube .watch-stage-mode #placeholder-player .player-api.player-width.player-height {
  width: 100vw !important;
  min-width: 1003px;
  max-width: 100%;
  height: 100vh !important;
  left: -50vw;
}

.bigtube .watch-stage-mode #player-mole-container #player-api {
  height: 100vh;
  width: 100vw;
  max-width: 100%;  
  min-width: 1003px;
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

#masthead-positioner:hover {
  opacity: 1;
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
                console.log('called reload');
                if (!document.applyBigtube) {
                  document.applyBigtube = function() {
                      if( !document.getElementById('page').classList.contains('watch-stage-mode')) {
                        document.getElementById('body-container').classList.add('bigtube');
                        window.dispatchEvent(new Event('resize')); 
                      } else {
                        document.getElementById('body-container').classList.remove('bigtube');
                      }
                      window.dispatchEvent(new Event('resize'));
                  } 
                }
                if (!document.changeTitle) {
                  document.changeTitle = function() {
                    if( !document.getElementById('page').classList.contains('watch-stage-mode')) {
                      document.getElementsByClassName('ytp-size-button')[0].title = 'Bigtube mode';
                    } 
                  }
                }
                document.getElementById('body-container').classList.add('bigtube');
                window.dispatchEvent(new Event('resize'));
                document.getElementsByClassName('ytp-size-button')[0].removeEventListener("click", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].removeEventListener("mouseover", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].addEventListener("click", document.applyBigtube);
                document.getElementsByClassName('ytp-size-button')[0].addEventListener("mouseover", document.changeTitle);
              `;

var staticCode = `
                console.log('called static');
                if (!document.applyBigtube) {
                  document.applyBigtube = function() {
                      if( !document.getElementById('page').classList.contains('watch-stage-mode')) {
                        document.getElementById('body-container').classList.add('bigtube');
                        window.dispatchEvent(new Event('resize')); 
                      } else {
                        document.getElementById('body-container').classList.remove('bigtube');
                      }
                      window.dispatchEvent(new Event('resize'));
                  } 
                }
                if (!document.changeTitle) {
                  document.changeTitle = function() {
                    if( !document.getElementById('page').classList.contains('watch-stage-mode')) {
                      document.getElementsByClassName('ytp-size-button')[0].title = 'Bigtube mode';
                    } 
                  }
                }
                if( document.getElementById('page').classList.contains('watch-stage-mode')) {
                  document.getElementById('body-container').classList.add('bigtube');
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
      code: "document.getElementById('body-container').classList.remove('bigtube');"
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
          document.getElementById('body-container').classList.remove('bigtube');
          if( !document.getElementById('page').classList.contains('watch-stage-mode')) {
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