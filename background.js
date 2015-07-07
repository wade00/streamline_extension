// displays page action if message received from content script
chrome.runtime.onMessage.addListener(function(msg, sender) {
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    chrome.pageAction.show(sender.tab.id);
  }
});

chrome.runtime.onMessage.addListener(function(msg) {
  if ((msg.from === 'content') && (msg.subject === 'mtFormFill')) {
    switch(msg.field) {
      case 'mtYear':
        var yearField = "var yearScript = document.createElement('script');\
                          yearScript.textContent = \"window.frames[0].Xrm.Page.getAttribute('sads_year').setValue('" + msg.value + "');\";\
                           document.head.appendChild(yearScript);"
        chrome.tabs.executeScript(null, { code: yearField });
        break;

      case 'mtSerial':
        var serialFill = "var serialScript = document.createElement('script');\
                          serialScript.textContent = \"window.frames[0].Xrm.Page.getAttribute('sads_serialnumber').setValue('" + msg.value + "');\";\
                           document.head.appendChild(serialScript);"
        chrome.tabs.executeScript(null, { code: serialFill });
        break;

      // Trying to make trimFunction mirror the priceFill. I want to inject a script that overrides the trim(sScript) function that's in MT
      case 'mtPrice':
        // var trimFunction = "var trimScript = document.createElement('script');\
        // alert('trimscript');\
        //                     trimScript.textContent = \"function trim(sString) {\
        //                       alert('trimmed!');\
        //                       if sString == undefined {\
        //                         sString = ' ';\
        //                       }\
        //                       while (sString.substring(0, 1) == ' ') {\
        //                         sString = sString.substring(1, sString.length);\
        //                       }\
        //                       while (sString.substring(sString.length - 1, sString.length) == ' ') {\
        //                         sString = sString.substring(0, sString.length - 1);\
        //                       }\
        //                       return sString;\
        //                     };\";\
        //                     document.head.appendChild(trimScript);\
        //                     window.frames[0].trim = trimScript;"
        // var trimFunction = "window.frames[0].trim = function(s) { s }; alert('trimFunc2');"
        var priceFill = "var priceScript = document.createElement('script');\
        alert('pricefill');\
                        priceScript.textContent = \"window.frames[0].Xrm.Page.data.entity.attributes.get('sads_price').setValue(" + msg.value + ");\";\
                        document.head.appendChild(priceScript);"
        // chrome.tabs.executeScript(null, { code: trimFunction });
        chrome.tabs.executeScript(null, { code: priceFill });
        break;

      case 'mtDesc':
        var descFill = "var descScript = document.createElement('script');\
                          descScript.textContent = \"window.frames[0].Xrm.Page.getAttribute('sads_description').setValue('" + msg.value + "');\";\
                           document.head.appendChild(descScript);"
        chrome.tabs.executeScript(null, { code: descFill });
        break;
    }
  }
});
