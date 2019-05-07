function launchPip() {
    if (!document.pictureInPictureEnabled) {
        return;
    }
    var videos = Array.from(document.getElementsByTagName("video"));
    if (!videos.length) {
        return;
    }

    if (document.body.hasAttribute("its-pipping")) {
        document.exitPictureInPicture();
        document.body.removeAttribute("its-pipping");
    }

    var video = videos[0]

    function percentageOfVideoInViewport(video) {
        var viewportHeight = window.innerHeight,
            scrollTop = window.scrollY,
            boundingRect = video.getBoundingClientRect(),
            elementOffsetTop = boundingRect.top,
            elementHeight = boundingRect.height;

        if (elementOffsetTop > (scrollTop + viewportHeight)) {
            return 0;
        } else if ((elementOffsetTop + elementHeight) < scrollTop) {
            return 100;
        } else {
            var distance = (scrollTop + viewportHeight) - elementOffsetTop;
            var percentage = distance / ((viewportHeight + elementHeight) / 100);
            return percentage;
        }
    }


    if (videos.length > 1) {
        videos.sort((a, b) => {
            // sort according to percentage in viewport
            var difference = percentageOfVideoInViewport(b) - percentageOfVideoInViewport(a);
            if (difference !== 0) {
                return difference;
            } else {
                // if equal, sort according to size
                var aRect = a.getBoundingClientRect();
                var bRect = b.getBoundingClientRect();
                return (b.height * b.width) - (a.height * a.width);
            }
        });
        video = videos[0];
    }

    // Override disables
    if (video.disablePictureInPicture) {
        video.disablePictureInPicture = false;
    }

    video.requestPictureInPicture();
    document.body.setAttribute("its-pipping", true)
}


function isPipBrowserAction(callback) {
    chrome.storage.local.get(BROWSER_ACTION, function (data) {
        if (!data[BROWSER_ACTION] || data[BROWSER_ACTION] === "pip") {
            callback();
        }
    });
}

chrome.browserAction.onClicked.addListener((tab) => {
    isPipBrowserAction(() => {
        chrome.tabs.executeScript(tab.id, {
            code: `(${launchPip.toString()})()`
        });
    });
});
