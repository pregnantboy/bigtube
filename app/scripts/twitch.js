const twitchCss = `
    .video-player--theatre-whispers.video-player--logged-in .video-player__container {
        bottom: 0 !important;
    }

    .whispers--theatre-mode {
        z-index: -1 !important;
    }
`

chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
    chrome.tabs.insertCSS({
        code: twitchCss
    });
}, {
        url: [
            { hostSuffix: '.twitch.tv' }
        ]
    });