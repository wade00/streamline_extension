// Content scripts are accessing the page's DOM (not the extension popup)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    if(request.greeting == "hello") {
      sendResponse({farewell: "goodbye"});
    }
  });
