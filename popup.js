// Sets popup inventory by pulling from machine-demo-app.herokuapp.com
$(window).ready(function() {
  var streamlineAPI = 'https://machine-demo-app.herokuapp.com/machines.json';
  $.getJSON(streamlineAPI, function(data) {
    $(data).each(function(index, value) {
      var stock_number = value['stock_number']
      $('#popup-inventory').append(
        "<tr id='machine_" + stock_number + "'>" +
        "<td>" + stock_number + "</td>" +
        "<td id='" + stock_number + "_make'>" + value['machine_make'] + "</td>" +
        "<td id='" + stock_number + "_model'>" + value['machine_model'] + "</td>" +
        "<td id='" + stock_number + "_type'>" + value['machine_type'] + "</td>" +
        "<td>" + "<button id='copy_" + value['stock_number'] + "'>Copy</button></li>" + "</td>" +
        "<td id='" + stock_number + "_hours' hidden>" + value['hours'] + "</td>" +
        "<td id='" + stock_number + "_price' hidden>" + value['price'] + "</td>" +
        "</tr>"
      );
    });
  });
});

// click copy button to send hours info to content script
$(window).ready(function() {
  var hours = $('#hours').html();
  $('#btn-hours').click(function() {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'check_hours', hours: hours}
      );
    });
  });
});

// click copy button to send price info to content script
$(window).ready(function() {
  var price = $('#39999_price').html();
  $('#copy_39999').click(function() {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'check_price', price: price}
      );
    });
  });
});

// trying to send content script the hours of a machine
// chrome.runtime.onMessage.addListener(function(msg, sender, response) {
//   if ((msg.from === 'content') && (msg.subject === 'searchFormValue')) {
//     var hours = '33'; //$('#39999_hours').html();
//     response(hours);
//   }
// });
