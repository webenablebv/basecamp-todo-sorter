let tabId;
let currentUrl = '';

chrome.webNavigation.onHistoryStateUpdated.addListener(async details => {
  tabId = details.tabId;
  currentUrl = details.url;
}, { urls: ['https://3.basecamp.com/*/buckets/*'] });

chrome.webRequest.onCompleted.addListener(details => {
  if (currentUrl != null && tabId > 0) {
    chrome.tabs.sendMessage(tabId, { type: 'page-rendered' });
  }
}, { urls: ['https://3.basecamp.com/*/buckets/*'] });