// displays page action if message received from content script
chrome.runtime.onMessage.addListener(function(msg, sender) {
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    chrome.pageAction.show(sender.tab.id);
  }
});

// Send request to current tab when page action is clicked
chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    chrome.tabs.sendMessage(
      tab.id,
      {callFunction: 'toggleSidebar'}
    );
  });
});
