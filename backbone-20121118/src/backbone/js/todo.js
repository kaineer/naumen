//
//
//
var Todo = {};

Todo.Model = Backbone.Model.extend({
  defaults: {
    note: "Do something",
    done: false
  }
});

Todo.Collection = Backbone.Collection.extend({
  model: Todo.Model,
  comparator: function(item) {
    return item.get("id");
  }
});

Todo.ItemView = Backbone.View.extend({
  tagName: "div",
  template: Handlebars.compile("" +
                               "<div class='check'><input class='box' type='checkbox' id='{{id}}'>" +
                               "</div><div class='note-text'>{{note}}</div>"),

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.addClass("item");
    this.$el.toggleClass('done', this.model.get('done'));
    return this;
  }
  
});

Todo.AppView = Backbone.View.extend({
  el: "#content",

  render: function() {
    var itemsContainer = this.$el.find("#items");
    this.collection.each(function(model) {
      var view = new Todo.ItemView({model: model});
      itemsContainer.append(view.render().$el);
    });
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
      items = (json ? eval(json) : []);

      return items;
    },
    store: function() {
      var json = JSON.stringify(Todo.items.toJSON());
      $.jStorage.set("todo-items", json);
    }
  });

  Todo.items = new Todo.Collection(Todo.load());
  
  var App = new Todo.AppView({collection: Todo.items});
  App.render();
});