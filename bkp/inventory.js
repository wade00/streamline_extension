// Sets popup inventory by pulling from machine-demo-app.herokuapp.com
var inventory = $(function() {
  var streamlineAPI = 'https://machine-demo-app.herokuapp.com/machines.json';
  $.getJSON(streamlineAPI, function(data) {
    $(data).each(function(index, value) {
      $('#popup-inventory').append(
        "<li class=" + "'machine_" + value['stock_number'] + "'>" + value['stock_number'] + " " + value['machine_make'] + " " + value['machine_model'] + " " + value['machine_type'] + "<button class='copy-button'>Copy</button></li>"
      );
    });
  });
});
