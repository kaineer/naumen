//
$(function() {
  //
  var items = [];

  var genId = function() {
    return (new Date) * 1;
  };

  var addItem = function(note) {
    items.push({id: genId(), note: note});
  };

  var removeItem = function(id) {
    items = _(items).reject(function(item) { return item.id == id; });
  };

  var hasItems = function() {
    return !_.isEmpty(items);
  };

  var renderItems = function() {
    return _(items).chain().map(function(item) {
      return "<div class='item'>" + 
        "<div class='check'><input type='checkbox' id='" + item.id + "'></div>" +
        "<div class='note-text'>" + item.note + "</div>" +
        "</div>";
    }).inject(function(html, itemHtml) { return html + itemHtml; }, "").value();
  };

  var renderContent = function() {
    if(hasItems()) {
      $("#items").html(renderItems());
    } else {
      $("#items").html("<div id='banner'>Делать пока нечего</div>");
    }
  };

  renderContent();
});