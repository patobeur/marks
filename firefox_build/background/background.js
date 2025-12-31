// Background service worker
console.log('Bookmark Cleaner Background Service Worker Loaded');

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});
