// displays page action if message received from content script
chrome.runtime.onMessage.addListener(function(msg, sender) {
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    chrome.pageAction.show(sender.tab.id);
  }
});
