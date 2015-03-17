Sets popup inventory by pulling from machine-demo-app.herokuapp.com
$(window).ready(function() {
  var streamlineAPI = 'https://machine-demo-app.herokuapp.com/machines.json';
  $.getJSON(streamlineAPI, function(data) {
    $(data).each(function(index, value) {
      var stock_number = value['stock_number']
      $('#popup-inventory').append(
        "<tr id='machine_" + stock_number + "'>" +
        "<td id='stock_number'>" + stock_number + "</td>" +
        "<td id='" + stock_number + "_make'>" + value['machine_make'] + "</td>" +
        "<td id='" + stock_number + "_model'>" + value['machine_model'] + "</td>" +
        "<td id='" + stock_number + "_type'>" + value['machine_type'] + "</td>" +
        "<td>" + "<button class='copy_machine' id=" + value['stock_number'] + ">Copy</button></li>" + "</td>" +
        "<td id='" + stock_number + "_year' hidden>" + value['year'] + "</td>" +
        "<td id='" + stock_number + "_hours' hidden>" + value['hours'] + "</td>" +
        "<td id='" + stock_number + "_price' hidden>" + value['price'] + "</td>" +
        "<td id='" + stock_number + "_location' hidden>" + value['location'] + "</td>" +
        "<td id='" + stock_number + "_serial' hidden>" + value['serial'] + "</td>" +
        "</tr>"
      );
    });
  });
});

// Click copy button to update multiple fields on ELS
$(window).ready('.copy_machine').click(function(button) {
  var stock_number = button.target.id;
  var year         = $('#' + stock_number + '_year').html();
  var make         = $('#' + stock_number + '_make').html();
  var model        = $('#' + stock_number + '_model').html();
  var type         = $('#' + stock_number + '_type').html();
  var serial       = $('#' + stock_number + '_serial').html();
  var hours        = $('#' + stock_number + '_hours').html();
  var price        = $('#' + stock_number + '_price').html();
  var location     = $('#' + stock_number + '_location').html();
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {from: 'popup',
      subject: 'copy_machine',
      url: tabs[0].url,
      stock_number: stock_number,
      year: year,
      make: make,
      model: model,
      type: type,
      serial: serial,
      hours: hours,
      price: price,
      location: location}
    );
  });
});
