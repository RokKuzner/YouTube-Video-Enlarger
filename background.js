// background.js

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    // Check if the URL is a YouTube video page
    if (details.url.includes("youtube.com/watch")) {
        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ['script.js']
        });
        chrome.scripting.insertCSS({ // For injecting styles.css
            target: { tabId: details.tabId },
            files: ['styles.css']
        });
        console.log("Content script injected into:", details.url);
    }
});

console.log("Background script running");
