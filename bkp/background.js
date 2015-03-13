
// Checks to see if any tab includes 'google' whenever a tab changes (add, remove, reload, etc)
chrome.tabs.onUpdated.addListener(showStreamlineAction);

function showStreamlineAction(tabId, changeInfo, tab) {
  if (tab.url.indexOf('google.') > -1) {
    // Show icon for page action in the current tab.
    chrome.pageAction.show(tabId);
  }
};

// searches browser for tabs that fit criterea specified in the options hash ... returns array i think
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});
