//
//
//
var Todo = {};

Todo.Model = Backbone.Model.extend({
  initialize: function() {
    if(this.get("id") < 1000) {
      this.set({id: (new Date)*1}, {silent: true});
    }
    this.on("change", Todo.store);
  },
  
  defaults: {
    note: "Do something",
    done: false
  }
});

Todo.Collection = Backbone.Collection.extend({
  initialize: function() {
    this.on("add clean:done", Todo.store, Todo);
  },
  model: Todo.Model,
  comparator: function(item) {
    return item.get("id");
  }
});

Todo.ItemView = Backbone.View.extend({
  initialize: function() {
    this.model.on("change:done", this.displayDone, this);
  },

  tagName: "div",
  events: {
    "click .check .box": "toggleDone"
  },

  template: Handlebars.compile("<div class='check'><input class='box' type='checkbox' id='{{id}}'>" +
                               "</div><div class='note-text'>{{note}}</div>"),

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.addClass("item");
    this.displayDone();
    return this;
  },

  toggleDone: function(e) {
    this.model.set({done: e.target.checked});
  },

  displayDone: function() {
    this.$el.toggleClass('done', this.model.get('done'));
    this.$el.find("input:checkbox").get(0).checked = this.model.get("done");
  }
  
});

Todo.PagingView = Backbone.View.extend({
  el: "#paging",

  initialize: function() {
    this.page = 1;
    this.pageSize = 5;
    this.collection.on("add clean:done", this.render, this);
  },

  itemTemplate: Handlebars.compile("<a href='#{{no}}'>{{no}}</a>"),

  adjustPage: function() {
    var maxPage = Math.ceil(this.collection.size() / this.pageSize);

    if(this.page < 1) { this.page = 1; }
    if(this.page > maxPage) { this.page = maxPage; }
  },
  
  render: function() {
    var t = this.itemTemplate;
    var maxPage = Math.ceil(this.collection.size() / this.pageSize);
    
    if(maxPage <= 1) {
      this.$el.html("");
      return this;
    }

    this.adjustPage();

    var html = "";

    _(_.range(1, maxPage + 1)).each(function(i) {
      html += t({no: i});
      if(i < maxPage) {
        html += "&nbsp;";
      }
    });

    this.$el.html(html);

    return this;
  }

});

Todo.AppView = Backbone.View.extend({
  initialize: function(options) {
    this.collection.on("add clean:done", this.render, this);
  },

  el: "#content",

  events: {
    "click #adding button": "addTodo",
    "keydown #todo":        "addOnEnter",
    "click #done button":   "cleanDone"
  },

  render: function() {
    var itemsContainer = this.$el.find("#items");
    itemsContainer.empty();

    var appView = this;
    this.collection.each(function(model) {
      var view = new Todo.ItemView({model: model});
      itemsContainer.append(view.render().$el);
    });
  },

  addTodo: function(e) {
    var $todo = this.$el.find("#todo");
    var note = $todo.val();
    this.collection.push(new Todo.Model({note: note}));
    $todo.val("");
  },

  addOnEnter: function(e) {
    if(e.which == 13) {
      this.addTodo(e);
    }
  },

  cleanDone: function() {
    this.collection.reset(
      this.collection.reject(function(item) { return item.get("done"); })
    );
    this.collection.trigger("clean:done");
  }
});


$(function() {
  //
  _.extend(Todo, {
    pageSize: 5,
    items: [],
    page: 1,
    load: function() {
      var json;

      json = $.jStorage.get("todo-items");
      console.log(json);
      items = (json ? eval(json) : []);

      return _(items).map(function(item) { return new Todo.Model(item); });
    },
    store: function() {
      var json = JSON.stringify(Todo.items.toJSON());
      $.jStorage.set("todo-items", json);
    }
  });

  Todo.items = new Todo.Collection(Todo.load());
  
  var App = new Todo.AppView({collection: Todo.items});
  Todo.app = App;
  App.render();

  var Paging = new Todo.PagingView({collection: Todo.items});
  Paging.render();
});
