// Inform the backgrund page that this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

var elsREGEX = (/\w+:\/\/\w+.equipmentlocator.\w+\/*\w*/i);
var eaREGEX = (/\w+:\/\/\w+.equipmentalley.\w+\/*\w*/i);

// Listens for machine info message that sends when 'copy' is clicked in popup
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
  if ((msg.from === 'popup') && (msg.subject === 'copy_machine')) {

    // ELS autofill
    if (elsREGEX.test(msg.url)) {
      if ($('#EQUIPMENT_stock').val() != msg.stock_number) {
        alert("You're trying to copy a different machine. Are you sure you want to do that?");
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
