function launchPip() {
    if (!document.pictureInPictureEnabled) {
        return;
    }
    const videos = Array.from(document.querySelectorAll("video"));
    if (!videos.length) {
        return;
    }

    if (document.body.hasAttribute("its-pipping")) {
        document.exitPictureInPicture();
        document.body.removeAttribute("its-pipping");
    }

    let video = videos[0]

    function percentageOfVideoInViewport(video) {
        const viewportHeight = window.innerHeight;
        const boundingRect = video.getBoundingClientRect();
        const elementOffsetTop = boundingRect.top;
        const elementOffsetBottom = viewportHeight - boundingRect.bottom;
        const elementHeight = boundingRect.height;

        if (elementOffsetTop <= 0) {
            // element begins before start of viewport
            if ((elementOffsetTop + elementHeight) <= 0) {
                // element is completely above viewport
                return 0;
            } else {
                // element is partially above viewport
                // return 100 if partial video takes up entire screen
                return Math.min((elementOffsetTop + elementHeight), viewportHeight) / Math.min(elementHeight, viewportHeight) * 100
            }
        } else {
            // element begins after start of viewport
            if (elementOffsetTop > viewportHeight) {
                // element begins after end of viewport
                return 0;
            } else {
                // element starts somewhere in the viewport
                return (viewportHeight - elementOffsetTop - Math.max(elementOffsetBottom, 0)) / Math.min(elementHeight, viewportHeight) * 100
            }
        }
    }


    if (videos.length > 1) {
        videos.sort((a, b) => {
            // sort according to percentage in viewport
            var difference = percentageOfVideoInViewport(b) - percentageOfVideoInViewport(a);
            if (difference !== 0) {
                return difference;
            } else {
                // if equal visibility, sort according to size
                return (b.clientHeight * b.clientWidth) - (a.clientHeight * a.clientWidth);
            }
        });
        video = videos[0];
    }

    // Override disables
    if (video.disablePictureInPicture) {
        video.disablePictureInPicture = false;
    }

    try {
        video.requestPictureInPicture();
        document.body.setAttribute("its-pipping", true);
    } catch (e) {
        console.log(e)
    }
}

let isPipBrowserAction = true
chrome.storage.local.get(BROWSER_ACTION, function (data) {
    if (data[BROWSER_ACTION] && data[BROWSER_ACTION] !== "pip") {
        isPipBrowserAction = false;
    }
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes[BROWSER_ACTION]) {
        const newValue = changes[BROWSER_ACTION].newValue;
        isPipBrowserAction = (newValue === 'pip' || newValue == undefined)
    }
});


chrome.browserAction.onClicked.addListener((tab) => {
    if (isPipBrowserAction) {
        console.log('pip')
        chrome.tabs.executeScript(tab.id, {
            code: `(${launchPip.toString()})()`,
            allFrames: true
        });
    }
});
