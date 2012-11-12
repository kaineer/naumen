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

Todo.Paging = Backbone.Model.extend({
  defaults: {
    page: 1,
    pageSize: 5,
    maxPage: 1
  },
  recalc: function(collection) {
    var pageSize = this.get("pageSize");
    var maxPage = Math.ceil(collection.size() / pageSize);

    var page = this.get("page");
    
    if(page < 1) { page = 1; }
    if(page > maxPage) { page = maxPage; }

    this.set({page: page, maxPage: maxPage});
  },
  needsRender: function() {
    return this.get("maxPage") > 1;
  },
  startOfPage: function() {
    var page = this.get("page");
    var pageIdx = page - 1;
    var pageSize = this.get("pageSize");

    return pageIdx * pageSize;
  },
  endOfPage: function() {
    var page = this.get("page");
    var pageIdx = page;
    var pageSize = this.get("pageSize");

    return pageIdx * pageSize;
  }
});

Todo.PagingView = Backbone.View.extend({
  el: "#paging",

  initialize: function() {
    this.paging = new Todo.Paging();
    this.pageSize = this.paging.get("pageSize");
    this.collection.on("add clean:done", this.render, this);
    this.collection.on("add clean:done", this.recalcPaging, this);
    this.paging.on("change", this.render, this);
  },

  itemTemplate: Handlebars.compile("<a href='#{{no}}' class='{{kls}}'>{{no}}</a>"),

  recalcPaging: function() {
    this.paging.recalc(this.collection);
  },
  
  render: function() {
    var t = this.itemTemplate;
    var maxPage = this.paging.get("maxPage");
    var page = this.paging.get("page");
    
    if(!this.paging.needsRender()) {
      this.$el.html("");
      return this;
    }

    var html = "";

    _(_.range(1, maxPage + 1)).each(function(i) {
      html += t({no: i, kls: (i == page) ? "active" : ""});
    });

    this.$el.html(html);

    return this;
  }

});

Todo.AppView = Backbone.View.extend({
  initialize: function(options) {
    this.collection.on("add clean:done", this.render, this);
  },

  setPaging: function(paging) {
    this.paging = paging;
    
    this.paging.on("change:page", this.render, this);
  },

  el: "#content",

  events: {
    "click #adding button": "addTodo",
    "keydown #todo":        "addOnEnter",
    "click #done button":   "cleanDone"
  },

  getPageItems: function() {
    var indexFrom = this.paging.startOfPage();
    var indexTo = this.paging.endOfPage();

    return this.collection.toArray().slice(indexFrom, indexTo);
  },

  render: function() {
    var itemsContainer = this.$el.find("#items");
    itemsContainer.empty();

    var appView = this;
    _(this.getPageItems()).each(function(model) {
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

    if(this.router) {
      console.log("boom");
      this.router.navigate(this.paging.get("page") + "");
    }
  }
});


$(function() {
  //
  _.extend(Todo, {
    // pageSize: 5,
    // items: [],
    // page: 1,
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
  // App.render();

  var pagingView = new Todo.PagingView({collection: Todo.items});
  // pagingView.render();

  App.setPaging(pagingView.paging);

  pagingView.paging.recalc(App.collection);

  pagingView.render();
  App.render();
  

  Todo.Router = Backbone.Router.extend({
    routes: {
      "": "page",
      ":page": "page"
    },
    
    page: function(pageNo) {
      pageNo || (pageNo = 1);
      pagingView.paging.set({page: pageNo});
    }
  });

  App.router = new Todo.Router();

  Backbone.history.start();
});
