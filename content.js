// Inform the backgrund page that this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

// ELS auto-fill message
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
  if ((msg.from === 'popup') && (msg.subject === 'ELS_copy_machine')) {
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
});
