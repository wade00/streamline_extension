// Inform the backgrund page that this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

// listens for message from popup and fills google search form with values depending on message subject
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
  if ((msg.from === 'popup') && (msg.subject === 'check_hours')) {
    $('#lst-ib').val(msg.hours);
  }

  if ((msg.from === 'popup') && (msg.subject === 'check_price')) {
    $('#lst-ib').val(msg.price);
  }
});


// trying to set the google search form automatically with the hours of a machine in the popup
// function setGoogleForm(input) {
//   $('#lst-ib').val(input);
// }

// chrome.runtime.sendMessage({ from: 'content', subject: 'searchFormValue' }, setGoogleForm);
