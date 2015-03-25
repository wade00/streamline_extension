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
var buttonDisplayed;
function displayButton() {
  var inventoryButton = document.createElement('div');
  inventoryButton.id = "showInventoryButton";
  $(inventoryButton).html("<p class='copy' hidden>Copy it.</p>")
  $(inventoryButton).css({
    'position': 'fixed',
    'top': '30px',
    'right': '0px',
    'width': '5%',
    'height': '5%',
    'background': '#4A5063',
    'color': '#EEE',
    'text-align': 'center',
    'font-size': '14px',
    'font-family': '"Helvetica", "Arial", "sans-serif"',
    'box-shadow': '1px 2px 5px black',
    'border-radius':'2px 0 0 2px',
    'cursor': 'pointer',
    'display': 'none'
  });
  document.body.appendChild(inventoryButton);
  $(inventoryButton).effect('slide', {'direction': 'right'}, function() {
    $('.copy').toggle('fade', 'slow');
  });
  buttonDisplayed = true;
}

$('#showInventoryButton').hover(function(){
    $(this).animate({'width': '6%',
                     'background-color': '#3B404F',
                     'color': '#FFF',
                     }, 500);
  }, function() {
    $(this).animate({'width': '5%',
                     'background-color': '#4A5063',
                     'color': '#EEE',
                     }, 500);
});

$(document).on('click', '#showInventoryButton', function() {
  if (buttonDisplayed) {
    var inventoryButton = document.getElementById('showInventoryButton');
    inventoryButton.parentNode.removeChild(inventoryButton);
    buttonDisplayed = false;
  }
  toggleSidebar();
});

// Inject sidebar into page
var sidebarOpen;
var sidebarLoaded = false;
function toggleSidebar() {
  if (sidebarLoaded) {
    $('#inventorySidebar').toggle('slide', {'direction': 'right'}, 500);
    if (sidebarOpen) {
      $('body').animate({'width': '100%'}, 500);
      sidebarOpen = false;
    }
    else {
      $('body').animate({'width': '75%'}, 500);
      sidebarOpen = true;
    }
    // need to get content source attribute working to refresh iframes in MT
    $('#contentIFrame').attr('contentsrc', function (i, val) {
      return val;
    });
  }
  else {
    var sidebar = document.createElement('div');
    sidebar.id = "inventorySidebar";
    $(sidebar).html("\
      <div class='header'>\
        <h2 class='streamline-logo'>Streamline <span id='close-popup'>x</span></h2>\
      </div>\
      <hr class='divider' />\
      <h3 class='my-inventory-header'>My Inventory</h3>\
      <div class='inventory-table-container'>\
        <table class='inventory-table'>\
          <tbody id='inventory'>\
          </tbody>\
        </table>\
      </div>\
    ");
    $('body').append(sidebar);
    $(sidebar).toggle('slide', {'direction': 'right'}, 500);
    $('body').animate({'width': '75%'}, 500);

    // Loads inventory into sidebar by parsing json from heroku site
    var streamlineAPI = 'https://machine-demo-app.herokuapp.com/machines.json';
    $.getJSON(streamlineAPI, function(data) {
      $(data).each(function(index, value) {
        var locationAPI = 'https://machine-demo-app.herokuapp.com/locations/' + value['location'] + '.json';
        $.getJSON(locationAPI, function(json) {
          var JSONaddress = json.address;
          var JSONcity = json.city;
          var JSONstate = json.state;
          var JSONzip = json.zip;
          var JSONphone = json.phone;
          var stock_number = value['stock_number']
          $('#inventory').append(
            "<tr class='machine-preview'>" +
              "<td class='machine-preview-cell' colspan='3' id='" + stock_number + "'>" +
                "<strong class='stock-number' id='" + stock_number + "'>" + stock_number + "</strong>" + " " +
                "<small id='" + stock_number + "'>" +
                  value['machine_make'] + " " + value['machine_model'] + " " + value['machine_type'] +
                "</small>" + " " +
              "</td>" +
              "<td>" +
                "<span class='copy-machine' id='" + stock_number + "'>Copy</span>" +
              "</td>" +
            "</tr>" +
            // hidden values
            "<tr class='machine-preview-stats' id='machine_" + stock_number + "' hidden>" +
              "<td id='" + stock_number + "_make' hidden>" + value['machine_make'] + "</td>" +
              "<td id='" + stock_number + "_model' hidden>" + value['machine_model'] + "</td>" +
              "<td id='" + stock_number + "_type' hidden>" + value['machine_type'] + "</td>" +
              "<td id='" + stock_number + "_year' hidden>" + value['year'] + "</td>" +
              "<td id='" + stock_number + "_serial' hidden>" + value['serial'] + "</td>" +
              "<td id='" + stock_number + "_hours' hidden>" + value['hours'] + "</td>" +
              "<td id='" + stock_number + "_price' hidden>" + value['price'] + "</td>" +
              "<td id='" + stock_number + "_address' hidden>" + JSONaddress + "</td>" +
              "<td id='" + stock_number + "_city' hidden>" + JSONcity + "</td>" +
              "<td id='" + stock_number + "_state' hidden>" + JSONstate + "</td>" +
              "<td id='" + stock_number + "_zip' hidden>" + JSONzip + "</td>" +
              "<td id='" + stock_number + "_phone' hidden>" + JSONphone + "</td>" +
              "<td id='" + stock_number + "_description' hidden>" + value['description'] + "</td>" +
            "</tr>"
          );
        });
      });
    });
    sidebarOpen = true;
    sidebarLoaded = true;
    // not working: need to get content source attribute working to refresh iframes in MT
    $('#contentIFrame').attr('contentsrc', function (i, val) {
      return val;
    });
  }
}

// Click 'x' to close sidebar
$(document).on('click', '#close-popup', function() {
  toggleSidebar();
  displayButton();
});

$(document).on('click', '.machine-preview-cell', function(btn) {
  var stock_number    = btn.target.id;
  var year            = $('#' + stock_number + '_year').html();
  var make            = $('#' + stock_number + '_make').html();
  var model           = $('#' + stock_number + '_model').html();
  var type            = $('#' + stock_number + '_type').html();
  var serial          = $('#' + stock_number + '_serial').html();
  var hours           = $('#' + stock_number + '_hours').html();
  var price           = $('#' + stock_number + '_price').html();
  var address         = $('#' + stock_number + '_address').html();
  var city            = $('#' + stock_number + '_city').html();
  var state           = $('#' + stock_number + '_state').html();
  var zip             = $('#' + stock_number + '_zip').html();
  var phone           = $('#' + stock_number + '_phone').html();
  var description     = $('#' + stock_number + '_description').html();

  var elsREGEX = (/\w+:\/\/\w+.equipmentlocator.\w+\/*\w*/i);
  var eaREGEX = (/\w+:\/\/\w+.equipmentalley.\w+\/*\w*/i);
  var mtREGEX = (/\w+:\/\/dscrm.sandhills.\w+\/*\S*/i);
  var siteURL = document.URL;

  // Equipment Locator autofill
  if (elsREGEX.test(siteURL)) {
    if ($('#EQUIPMENT_stock').val() !== stock_number) {
      confirm("Are you sure you want to copy" + " " +
            stock_number + " " +
            "into stock number" + " " +
            $('#EQUIPMENT_stock').val() + "?"
           );
    }
    else if ($('#EQUIPMENT_stock').val() === stock_number) {
      if ($('#EQUIPMENT_control').val() !== phone) {
        $('#EQUIPMENT_control').val(phone).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_year').val() !== year) {
        $('#EQUIPMENT_year').val(year).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_make').val() !== make) {
        $('#EQUIPMENT_make').val(make).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_model').val() !== model) {
        $('#EQUIPMENT_model').val(model).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_serial').val() !== serial) {
        $('#EQUIPMENT_serial').val(serial).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_hrs').val() !== hours) {
        $('#EQUIPMENT_hrs').val(hours).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_price').val() !== price) {
        $('#EQUIPMENT_price').val(price).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_ecity').val() !== city) {
        $('#EQUIPMENT_ecity').val(city).effect('highlight', 'slow');
      }

      if ($('#EQUIPMENT_estate').val() !== state) {
        $('#EQUIPMENT_estate').val(state).effect('highlight', 'slow');
      }

      if ($('#EQUIP_NOTE_note').val() !== description) {
        $('#EQUIP_NOTE_note').val(description).effect('highlight', 'slow');
      }
    }
  }

  // Equipment Alley autofill
  if (eaREGEX.test(siteURL)) {
    if ($('#STOCK').val() !== stock_number) {
      alert("I can't copy stock number" + " " +
            stock_number + " " +
            "into stock number" + " " +
            $('#STOCK').val()
           );
    }
    else if ($('#STOCK').val() === stock_number) {
      if ($('#Se_CategoryID').val() === "") {
        alert("You haven't chosen a category. Please select something first.");
      }

      if ($('#MFG').val() === "") {
        alert("You haven't chosen a manufacturer. Please select something first.");
      }

      if ($('#MODEL').val() !== model) {
        $('#MODEL').val(model).effect('highlight', 'slow');
      }

      if ($('#YEAR').val() !== year) {
        $('#YEAR').val(year).effect('highlight', 'slow');
      }

      if ($('#SERIAL').val() !== serial) {
        $('#SERIAL').val(serial).effect('highlight', 'slow');
      }

      if ($('#HOURS').val() !== hours) {
        $('#HOURS').val(hours).effect('highlight', 'slow');
      }

      if ($('#_PUBL_DLR_ADDRESS').val() !== address) {
        $('#_PUBL_DLR_ADDRESS').val(address).effect('highlight', 'slow');
      }

      if ($('#_PUBL_DLR_CITY').val() !== city) {
        $('#_PUBL_DLR_CITY').val(city).effect('highlight', 'slow');
      }

      if ($('#_STATE').val() !== state) {
        $('#_STATE').val(state).effect('highlight', 'slow');
      }

      if ($('#_PUBL_DLR_ZIP').val() !== zip) {
        $('#_PUBL_DLR_ZIP').val(zip).effect('highlight', 'slow');
      }

      if ($('#_RETAIL_PRICE').val() !== price) {
        $('#_RETAIL_PRICE').val(price).effect('highlight', 'slow');
      }

      if ($('[name="DESCRIPTION"]').val() !== description) {
        $('[name="DESCRIPTION"]').val(description).effect('highlight', 'slow');
      }
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

    if (mtStockNumber.val() !== stock_number) {
      alert("I can't copy stock number" + " " +
            stock_number + " " +
            "into stock number" + " " +
            mtStockNumber.val()
           );
    }
    else if (mtStockNumber.val() === stock_number) {
      // Fills forms
      $(mtYear).val(parseInt(year) - 1899).effect('highlight', 'slow'); // option select
      $(mtMake).val(make.toUpperCase()).effect('highlight', 'slow');
      $(mtModel).val(model).effect('highlight', 'slow');
      $(mtSerial).val(serial).effect('highlight', 'slow');
      $(mtHours).val(hours).effect('highlight', 'slow');
    }
  }
});
