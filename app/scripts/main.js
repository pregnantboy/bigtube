chrome.runtime.onInstalled.addListener(() => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    }
});