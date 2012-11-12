//
$(function() {
  //
  var items = [];
  var page = 1;

  var count = 1;

  var storeItems = function() {
    var json = JSON.stringify(items);
    $.jStorage.set("todo-items", JSON.stringify(items));
  };

  var loadItems = function() {
    var json = $.jStorage.get("todo-items");
    items = (json ? eval(json) : []);
  };

  var genId = function() {
    return (new Date) * 1;
  };

  var addItem = function(note) {
    items.push({id: genId(), note: note, done: false});
    storeItems();
  };

  var removeItem = function(id) {
    items = _(items).reject(function(item) { return item.id == id; });
    storeItems();
  };

  var removeDone = function() {
    items = _(items).reject(function(item) { return item.done; });
    storeItems();
  };

  var hasItems = function() {
    return !_.isEmpty(items);
  };

  var checkboxAttr = function(item) {
    if(item.done) {
      return " checked='checked'";
    } else {
      return "";
    }
  };

  var itemDivClass = function(item) {
    if(item.done) {
      return "item done";
    } else {
      return "item";
    }
  };

  var renderItems = function() {
    return _(items).chain().map(function(item) {
      return "<div class='" + itemDivClass(item) + "'>" + 
        "<div class='check'><input class='box' type='checkbox' id='" + item.id + 
          "'" + checkboxAttr(item) + "></div>" +
        "<div class='note-text'>" + item.note + "</div>" +
        "</div>";
    }).inject(function(html, itemHtml) { return html + itemHtml; }, "").value();
  };

  var renderPaging = function() {
    var maxPage = Math.ceil(_.size(items) / 5);
    var i;
    var str = "";

    if(maxPage <= 1) {
      return "";
    }

    if(page < 1) { page = 1; }
    if(page > maxPage) { page = maxPage; }
    
    for(i = 1; i <= maxPage; i++) {
      str += "<a href='#" + i + "'>" + i + "</a>";
      if(i < maxPage) {
        str += "&nbsp;";
      }
    }

    return str;
  };


  var renderContent = function() {
    if(hasItems()) {
      $("#items").html(renderItems());
    } else {
      $("#items").html("<div id='banner'>Делать пока нечего</div>");
    }

    $("#paging").html(renderPaging());
  };

  var addTODO = function() {
    addItem($("#todo").val());
    renderContent();
    $("#todo").val("");
  };

  var route = function(hash) {
    console.log(hash);
  };

  $("#adding button").click(addTODO);
  $("#todo").keydown(function(e) {
    if(e.which == 13) { // Enter
      addTODO();
    }
  });
  
  $("#items").on("click", ".check .box", function(e) { // Magic function `on`
    var id = $(this).attr("id");
    var item = _(items).find(function(item) { return item.id == id; });
    item.done = this.checked;
    storeItems();
    
    // $(this).parents(".item")[item.done ? "addClass" : "removeClass"]("done");
    if(item.done) {
      $(this).parents(".item").addClass("done");
    } else {
      $(this).parents(".item").removeClass("done");
    }
  });

  $("#done button").click(function() {
    removeDone();
    renderContent();
  });

  $("#paging").on("click", "a", function(e) {
    route(this.hash);
  });

  loadItems();
  renderContent();
  route(window.location.hash);
});
