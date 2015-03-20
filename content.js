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

// Inject show inventory button into page
window.onload = displayButton();
var buttonDisplayed = true;
function displayButton() {
  var inventoryButton = document.createElement('div');
  inventoryButton.id = "showInventoryButton";
  inventoryButton.innerHTML = "Show Inventory";
  inventoryButton.style.cssText = "\
    position:fixed;\
    top:0px;\
    right:0px;\
    width:8%;\
    height:4%;\
    background:rgba(255,255,255,0.8);\
    box-shadow: 0 0 5em black;\
    z-index:999999;\
    cursor:pointer;\
    font-size:14px;\
    text-align:center;\
  ";
  document.body.appendChild(inventoryButton);
  buttonDisplayed = true;
}

$('#showInventoryButton').click(function() {
  if(buttonDisplayed) {
    var element = document.getElementById('showInventoryButton');
    element.parentNode.removeChild(element);
    buttonDisplayed = false;
  }
  toggleSidebar();
});

// Inject sidebar into page
var sidebarOpen = false;
function toggleSidebar() {
  if(sidebarOpen) {
    var element = document.getElementById('inventorySidebar');
    element.parentNode.removeChild(element);
    sidebarOpen = false;
  }
  else {
    var $body = document.body;
    var sidebar = document.createElement('div');
    sidebar.id = "inventorySidebar";
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

    // Loads inventory into sidebar by parsing json from heroku site
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

$(document).on('click', '.copy_machine', function(btn) {
  var stock_number = btn.target.id;
  var year         = $('#' + stock_number + '_year').html();
  var make         = $('#' + stock_number + '_make').html();
  var model        = $('#' + stock_number + '_model').html();
  var type         = $('#' + stock_number + '_type').html();
  var serial       = $('#' + stock_number + '_serial').html();
  var hours        = $('#' + stock_number + '_hours').html();
  var price        = $('#' + stock_number + '_price').html();
  var location     = $('#' + stock_number + '_location').html();

  var elsREGEX = (/\w+:\/\/\w+.equipmentlocator.\w+\/*\w*/i);
  var eaREGEX = (/\w+:\/\/\w+.equipmentalley.\w+\/*\w*/i);
  var mtREGEX = (/\w+:\/\/dscrm.sandhills.\w+\/*\S*/i);
  var siteURL = document.URL;

  // Equipment Locator autofill
  if (elsREGEX.test(siteURL)) {
    if ($('#EQUIPMENT_stock').val() != stock_number) {
      alert("I can't copy stock number" + " " +
             stock_number + " " +
             "into stock number" + " " +
             $('#EQUIPMENT_stock').val());
    }
    else if ($('#EQUIPMENT_stock').val() === stock_number) {
      $('#EQUIPMENT_year').val(year).effect('highlight', 'slow');
      $('#EQUIPMENT_make').val(make).effect('highlight', 'slow');
      $('#EQUIPMENT_model').val(model).effect('highlight', 'slow');
      $('#EQUIPMENT_serial').val(serial).effect('highlight', 'slow');
      $('#EQUIPMENT_hrs').val(hours).effect('highlight', 'slow');
      $('#EQUIPMENT_price').val(price).effect('highlight', 'slow');
      $('#EQUIPMENT_ecity').val(location).effect('highlight', 'slow');
    }
  }

  // Equipment Alley autofill
  if (eaREGEX.test(siteURL)) {
    if ($('#STOCK').val() != stock_number) {
      alert("I can't copy stock number" + " " +
             stock_number + " " +
             "into stock number" + " " +
             $('#STOCK').val());
    }
    else if ($('#STOCK').val() === stock_number) {
      $('#YEAR').val(year).effect('highlight', 'slow');
      $('#MFG').val(make).effect('highlight', 'slow');
      $('#MODEL').val(model).effect('highlight', 'slow');
      $('#SERIAL').val(serial).effect('highlight', 'slow');
      $('#HOURS').val(hours).effect('highlight', 'slow');
      $('#_RETAIL_PRICE').val(price).effect('highlight', 'slow');
    }
  }

  // Machinery Trader DSCRM autofill
  if (mtREGEX.test(siteURL)) {
    // Find iframes on page
    var $contentIFrameContents = $('#contentIFrame').contents();
    var $iframeCatMakeModelContents = $contentIFrameContents.find('#IFRAME_CatMakeModel').contents();
    var $iframeSpecsContents = $contentIFrameContents.find('#IFRAME_Specs').contents();

    var mtStockNumber = $contentIFrameContents.find('#sads_stocknumber');
    var mtYear = $contentIFrameContents.find('#sads_year');
    var mtMake = $iframeCatMakeModelContents.find('#crm_txtTypedManufacturer'); // text field - select if necessary
    var mtModel = $iframeCatMakeModelContents.find('#crm_txtTypedModel'); // text field - use select if necessary
    var mtType = $iframeCatMakeModelContents.find('#crm_ddlCategory'); // select - need to log values
    var mtSerial = $contentIFrameContents.find('#sads_serialnumber');
    var mtHours = $iframeSpecsContents.find('#crm_ctlSpecNamehours');

    // need to figure out price and location (table not currently displayed)

    if ($(mtStockNumber).val() != stock_number) {
      alert("I can't copy stock number" + " " +
             stock_number + " " +
             "into stock number" + " " +
             $(mtStockNumber).val());
    }
    else if ($(mtStockNumber).val() === stock_number) {
      // Removes display:none from all tables
      $('.ms-crm-InlineTabBody').show('slow');

      // // Fills forms
      // $(mtYear).val(parseInt(year) - 1899).effect('highlight', 'slow'); // option select
      // $(mtMake).val(make.toUpperCase()).effect('highlight', 'slow');
      // $(mtModel).val(model).effect('highlight', 'slow');
      // $(mtSerial).val(serial).effect('highlight', 'slow');
      // $(mtHours).val(hours).effect('highlight', 'slow');
    }
  }
});
