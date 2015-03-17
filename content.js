// Inform the backgrund page that this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

// Listens for sidebar message from background script
function handleMessage(msg, sender, sendResponse) {
if (msg.callFunction == "toggleSidebar") {
    toggleSidebar();
  }
}
chrome.runtime.onMessage.addListener(handleMessage);

// Inject sidebar into page
var sidebarOpen = false;
function toggleSidebar() {
  if(sidebarOpen) {
    var el = document.getElementById('mySidebar');
    el.parentNode.removeChild(el);
    sidebarOpen = false;
  }
  else {
    var $body = document.body;
    var sidebar = document.createElement('div');
    sidebar.id = "mySidebar";
    sidebar.innerHTML = "\
      <h1>My Inventory</h1>\
      <table>\
      <tbody id='inventory'>\
      </tbody>\
      </table>\
    ";
    sidebar.style.cssText = "\
      position:fixed;\
      top:0px;\
      right:0px;\
      width:25%;\
      height:100%;\
      background:white;\
      box-shadow: 0 0 5em black;\
      z-index:999999;\
    ";
    $body.appendChild(sidebar);
    sidebarOpen = true;

    var streamlineAPI = 'https://machine-demo-app.herokuapp.com/machines.json';
    $.getJSON(streamlineAPI, function(data) {
      $(data).each(function(index, value) {
        var stock_number = value['stock_number']
        $('#inventory').append(
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
  }
}

var elsREGEX = (/\w+:\/\/\w+.equipmentlocator.\w+\/*\w*/i);
var eaREGEX = (/\w+:\/\/\w+.equipmentalley.\w+\/*\w*/i);

// Listens for machine info message that sends when 'copy' is clicked in popup
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
  if ((msg.from === 'popup') && (msg.subject === 'copy_machine')) {

    // ELS autofill
    if (elsREGEX.test(msg.url)) {
      if ($('#EQUIPMENT_stock').val() != msg.stock_number) {
        alert("I can't copy stock number" + " " + msg.stock_number + " " + "into stock number" + " " + $('#EQUIPMENT_stock').val());
      } else if ($('#EQUIPMENT_stock').val() === msg.stock_number) {
        $('#EQUIPMENT_year').val(msg.year).effect('highlight', 'slow');
        $('#EQUIPMENT_make').val(msg.make).effect('highlight', 'slow');
        $('#EQUIPMENT_model').val(msg.model).effect('highlight', 'slow');
        $('#EQUIPMENT_serial').val(msg.serial).effect('highlight', 'slow');
        $('#EQUIPMENT_hrs').val(msg.hours).effect('highlight', 'slow');
        $('#EQUIPMENT_price').val(msg.price).effect('highlight', 'slow');
        $('#EQUIPMENT_ecity').val(msg.location).effect('highlight', 'slow');
      }
    }

    // Equipment Alley autofill
    if (eaREGEX.test(msg.url)) {
      if ($('#STOCK').val() != msg.stock_number) {
        alert("You're trying to copy a different machine. Are you sure you want to do that?");
      } else if ($('#STOCK').val() === msg.stock_number) {
        $('#YEAR').val(msg.year).effect('highlight', 'slow');
        $('#MFG').val(msg.make).effect('highlight', 'slow');
        $('#MODEL').val(msg.model).effect('highlight', 'slow');
        $('#SERIAL').val(msg.serial).effect('highlight', 'slow');
        $('#HOURS').val(msg.hours).effect('highlight', 'slow');
        $('#_RETAIL_PRICE').val(msg.price).effect('highlight', 'slow');
      }
    }
  }
});
