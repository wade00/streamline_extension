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

// Sets regexs for sites and stores tab url in variable
var elsREGEX = (/\w+:\/\/\w+.equipmentlocator.\w+\/*\w*/i);
var eaREGEX  = (/\w+:\/\/\w+.equipmentalley.\w+\/*\w*/i);
var mtREGEX  = (/\w+:\/\/dscrm.sandhills.\w+\/*\S*/i);
var siteURL  = document.URL;

// Load show inventory button and sidebar into page DOM
window.onload = loadButton();
window.onload = loadSidebar();

// Load button function
var buttonDisplayed;
function loadButton() {
  var inventoryButton = document.createElement('div');
  inventoryButton.id = "showInventoryButton";
  $(inventoryButton).html("<p class='copy' hidden>Copy it.</p>")
  $(inventoryButton).css({
    'position': 'fixed',
    'top': '30px',
    'right': '0px',
    'width': '100px',
    'height': '40px',
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
  buttonDisplayed = false;
}

// Hover state for button
$('#showInventoryButton').hover(function(){
    $(this).animate({'width': '125px',
                     'background-color': '#3B404F',
                     'color': '#FFF',
                     }, 500);
  }, function() {
    $(this).animate({'width': '100px',
                     'background-color': '#4A5063',
                     'color': '#EEE',
                     }, 500);
});

// Load sidebar function
var sidebarOpen;
var sidebarLoaded;
var stockNumberArray = [];
function loadSidebar() {
  if (sidebarLoaded) {
    $('#inventorySidebar').remove();
    sidebarLoaded = false;
  }

  var sidebar = document.createElement('div');
  sidebar.id = "inventorySidebar";
  $(sidebar).html("\
    <div class='header'>\
      <h2 class='streamline-logo'>Streamline<span id='close-popup'>x</span></h2>\
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

  // Loads inventory into sidebar by parsing json from heroku site
  var streamlineAPI = 'https://machine-demo-app.herokuapp.com/machines.json';
  var streamlineDataCall = $.getJSON(streamlineAPI, function(data) {
    $(data).each(function(index, value) {
      // Make call to locations api to get detailed data about address, city, etc
      var locationAPI = 'https://machine-demo-app.herokuapp.com/locations/' + value['location'] + '.json';
      var stock_number  = value['stock_number'];
      $.getJSON(locationAPI, function(json) {
        var JSONaddress   = json.address;
        var JSONcity      = json.city;
        var JSONstate     = json.state;
        var JSONzip       = json.zip;
        var JSONphone     = json.phone;
        var JSONeaAccount = json.equipment_alley_account;
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
            "<td id='" + stock_number + "_eaAccount' hidden>" + JSONeaAccount + "</td>" +
            "<td id='" + stock_number + "_description' hidden>" + value['description'] + "</td>" +
          "</tr>"
        );
      });
      stockNumberArray.push(stock_number);
    });
  });
  sidebarOpen = false;
  sidebarLoaded = true;

  // Defers filling value of stockNumberArray until all JSON calls are done
  var checkArray = streamlineDataCall.then(
    function (data) {
      var defer = new $.Deferred();

      setTimeout(function () {
          console.log('Request completed');
          defer.resolve();
      },2000);

      return defer.promise();
    },
    function (err) {
      console.log('Step1 failed: Ajax request');
    }
  );

  // Iterates through stockNumberArray and checks to see if it's present on page, if so displays button
  streamlineDataCall.done(function() {
    $(stockNumberArray).each(function(index, value) {
      sidebarStockNumber = value;
      if (elsREGEX.test(siteURL)) {
        pageStockNumber = $('#EQUIPMENT_stock').val();
      }
      // EA isn't working because editing a st# doesn't trigger a whole page load,
      // just a div with id mainContainer is refreshing
      if (eaREGEX.test(siteURL)) {
        console.log($('#STOCK').val());
        pageStockNumber = $('#STOCK').val();
      }
      if (mtREGEX.test(siteURL)) {
        $iFrameContents = $('#contentIFrame').contents();
        mtStockNumber = $iFrameContents.find('#sads_stocknumber');
        pageStockNumber = mtStockNumber.val();
      }
      if (pageStockNumber === sidebarStockNumber) {
        $('#showInventoryButton').show('slide', {'direction': 'right'}, function() {
          $('.copy').show('fade', 'slow');
          buttonDisplayed = true;
        });
      }
    });
  });
}

// Clears stock number array and runs loadSidebar (for EA since page doesn't reload)
function resetSidebar() {
  stockNumberArray.length = 0;
  loadSidebar();
}

// Hides button when certain buttons clicked since EA page doesn't reload in between stock numbers
function hideButton() {
  $('#showInventoryButton').hide('fade', 'fast');
  $('.copy').hide('fade', 'fast');
  buttonDisplayed = false;
}

// Loads sidebar and checks stock numbers when clicking into a machine on EA
$(document).on('click', '#offertab1', resetSidebar);

// Hides inventory button when clicking 'go' or 'active equipment' buttons on EA
$(document).on('click', '#g1', hideButton);
$(document).on('click', '#tm_sell', hideButton);

// Click button to toggle sidebar and remove button
$(document).on('click', '#showInventoryButton', function() {
  toggleSidebar();
  $('#showInventoryButton').hide();
  buttonDisplayed = false;
});

// Toggle sidebar display
function toggleSidebar() {
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
  // $('#contentIFrame').attr('contentsrc', function (i, val) {
  //   return val;
  // });
}

// Click 'x' to close sidebar
$(document).on('click', '#close-popup', function() {
  toggleSidebar();
  $('#showInventoryButton').show();
  buttonDisplayed = true;
});

// function highlightBackground() {
//   this.css({'background-color': '#FFFF99'});
// }

// Auto fills when table row is clicked in sidebar
$(document).on('click', '.machine-preview-cell', function(btn) {
  var stock_number    = btn.target.id;
  var year            = $('#' + stock_number + '_year').html();
  var make            = $('#' + stock_number + '_make').html();
  var model           = $('#' + stock_number + '_model').html();
  var type            = $('#' + stock_number + '_type').html();
  var serial          = $('#' + stock_number + '_serial').html();
  var hours           = $('#' + stock_number + '_hours').html();
  var price           = $('#' + stock_number + '_price').html();
  var city            = $('#' + stock_number + '_city').html();
  var state           = $('#' + stock_number + '_state').html();
  var phone           = $('#' + stock_number + '_phone').html();
  var eaAccount       = $('#' + stock_number + '_eaAccount').html();
  var description     = $('#' + stock_number + '_description').html();

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
        $('#EQUIPMENT_control').val(phone).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_year').val() !== year) {
        $('#EQUIPMENT_year').val(year).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_make').val() !== make) {
        $('#EQUIPMENT_make').val(make).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_model').val() !== model) {
        $('#EQUIPMENT_model').val(model).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_serial').val() !== serial) {
        $('#EQUIPMENT_serial').val(serial).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_hrs').val() !== hours) {
        $('#EQUIPMENT_hrs').val(hours).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_price').val() !== price) {
        $('#EQUIPMENT_price').val(price).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_ecity').val() !== city) {
        $('#EQUIPMENT_ecity').val(city).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIPMENT_estate').val() !== state) {
        $('#EQUIPMENT_estate').val(state).css({'background-color': '#FFFF99'});;
      }

      if ($('#EQUIP_NOTE_note').val() !== description) {
        $('#EQUIP_NOTE_note').val(description).css({'background-color': '#FFFF99'});;
      }
    }
  }

  // Equipment Alley autofill
  if (eaREGEX.test(siteURL)) {
    if ($('#STOCK').val() !== stock_number) {
      confirm("Are you sure you want to copy" + " " +
              stock_number + " " +
              "into stock number" + " " +
              $('#EQUIPMENT_stock').val() + "?"
      );
    }
    else if ($('#STOCK').val() === stock_number) {
      if ($('#Se_CategoryID').val() === "") {
        alert("You haven't chosen a category. Please select something first.");
      }

      if ($('#MFG').val() === "") {
        alert("You haven't chosen a manufacturer. Please select something first.");
      }

      // if ($('#MODEL').val() !== model) {
      //   $('#MODEL').val(model).css({'background-color': '#FFFF99'});;
      // }

      // if ($('#YEAR').val() !== year) {
      //   $('#YEAR').val(year).css({'background-color': '#FFFF99'});;
      // }

      // if ($('#SERIAL').val() !== serial) {
      //   $('#SERIAL').val(serial).css({'background-color': '#FFFF99'});;
      // }

      // if ($('#HOURS').val() !== hours) {
      //   $('#HOURS').val(hours).css({'background-color': '#FFFF99'});;
      // }

      if ($('#_Location').val() !== eaAccount) {
        $('#_Location').val(eaAccount).css({'background-color': '#FFFF99'});;
        var locationSelect = $(document).find('#_Location');
        locationSelect.change();
      }

      // if ($('#_RETAIL_PRICE').val() !== price) {
      //   $('#_RETAIL_PRICE').val(price).css({'background-color': '#FFFF99'});;
      //   $('#_RETAIL_PRICE').change();
      // }

      // if ($('[name="DESCRIPTION"]').val() !== description) {
      //   $('[name="DESCRIPTION"]').val(description).css({'background-color': '#FFFF99'});;
      // }
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
      confirm("Are you sure you want to copy" + " " +
              stock_number + " " +
              "into stock number" + " " +
              $('#EQUIPMENT_stock').val() + "?"
      );
    }
    else if (mtStockNumber.val() === stock_number) {
      // Fills forms
      $(mtYear).val(parseInt(year) - 1899).css({'background-color': '#FFFF99'});; // option select
      $(mtMake).val(make.toUpperCase()).css({'background-color': '#FFFF99'});;
      $(mtModel).val(model).css({'background-color': '#FFFF99'});;
      $(mtSerial).val(serial).css({'background-color': '#FFFF99'});;
      $(mtHours).val(hours).css({'background-color': '#FFFF99'});;
    }
  }
});
