define(["BaseView",
  'lib/utils',
  'Bookmarks',
  'text!templates/streamsManager.template.html',
  'text!templates/bookmark.template.html'],

  function(BaseView, Utils, Bookmarks, streamsManagerTemplate, bookmarkTemplate) {
  "use strict";

  return BaseView.extend({
    
    el : "#stream-manager",

    template: _.template(streamsManagerTemplate),

    bookmarkTemplate: _.template(bookmarkTemplate),

    bookmarks: null,

    events: {
      "click .done": "close",
      "click .delete": "deleteBookmark",
      "click .cancel": "cancelEditStream",
      "click .add-new .show": "showAddInput",
      "submit .new-url-pattern": "addBookmark",
      "submit .update-url-pattern": "editBookmark",
      "click .edit-stream .show": "toggleEditStream",
      "click .enable-bookmark": "toggleBookmarkState",
      "click .select-all-bookmarks": "toggleAllBookmarks"
    },

    initialize: function(options){
      if(!options)
        options = {};

      this.render = _.debounce(this.render, 100);
      
      this.bookmarks = new Bookmarks();
      this.sources = options.sources;
      this.inspectorView = options.inspectorView;
      this.render(options);
      this.addListeners();
    },

    render: function(options){
      if(!options)
        options = {};

      // options.sources = options.sources || this.sources;
      this.$el.html(this.template({}));
      var list = this.renderBookmarks(options);
      this.$el.find("#stream-manager-list").append(list);

      if(!this.bookmarks.length){
        this.showAddInput();
      }
    },

    renderBookmarks: function(options){
      var html = "";
      this.bookmarks.each( function(bookmark, index){
        html += this.renderBookmark({ model: bookmark, index: index });
      }.bind(this));

      return html;
    },
      
    renderBookmark: function(options){
      return this.bookmarkTemplate(options);
    },

    addListeners: function(){
      this.listenTo(this.bookmarks, "add remove reset", function(bookmark){
        this.render();
      });
    },

    showAddInput: function(e){
      console.log("showAddInput");
      var $form = this.$el.find(".add-new .new-url-pattern");
      $form.removeClass("hidden");
      this.$el.find(".add-new .show").addClass("hidden");
      $form.find('.host').focus();
    },

    scrubPattern: function(params){
      if(!params || !params.scheme || !params.host || !params.path){
        return false;
      }

      params.scheme = params.scheme.replace(/\*+/g, "*");
      if(params.scheme.length === 0)
        params.scheme = "*";
      
      params.host = params.host.replace(/\*+/g, "*");
      if(params.host.length === 0)
        params.host = "*";

      params.path = params.path.replace(/\*+/g, "*");
      
      return params;
    },

    close: function(){
      this.inspectorView.showStreams();
    },

    editBookmark: function(e){
      Utils.stopEvent(e);
      var index = e.target.getAttribute("data-index");
      var $form = $(this.$el.find("form[data-index='" + index + "']")[0]);
      var options = {
        index  : index,
        enable : this.bookmarks.at(index).get("enable")
      };

      this.deleteBookmark(e);
      this.addBookmark(e, options);
    },

    highlightError: function(){
      console.log("highlightError");
    },

    cancelEditStream: function(e){
      this.toggleEditStream(e);
    },

    toggleEditStream: function(e){
      console.log("toggleEditStream");
      var index =  e.target.getAttribute("data-index");
      var $form = $(this.$el.find("form[data-index='" + index + "']")[0]);
      var $link = $(this.$el.find("a.show[data-index='" + index + "']")[0]);
      var $formatTag = $(this.$el.find(".format.tag[data-index='" + index + "']")[0]);
      if($link.hasClass("hidden")){
        $link.removeClass("hidden");
        $formatTag.removeClass("hidden");
        $form.addClass("hidden");
      } else {
        $link.addClass("hidden");
        $formatTag.addClass("hidden");
        $form.removeClass("hidden");
      }

    },

    addBookmark: function(e, options){
      Utils.stopEvent(e);
      if(!e.target)
        return;

      if(!options)
        options = {};

      this.$el.find(".add-new .show").removeClass("hidden");
      this.$el.find(".add-new .new-url-pattern").addClass("hidden");

      var $form  = $(e.target);
      var data = this.scrubPattern({
        format: $form.find('.format').val(),
        scheme: $form.find('.scheme').val(),
        host  : $form.find('.host').val(),
        path  : $form.find('.path').val()
      });

      if(data){
        var index = options.index || this.bookmarks.length;
        data.enable = true;
        this.bookmarks.add(data, {at: index});
        if(options.enable)
          this.sources.add(data);
      }
    },

    deleteBookmark: function(e){
      var index =  e.target.getAttribute("data-index");
      var bookmark = this.bookmarks.at(index);
      if(bookmark){
        this.bookmarks.remove(bookmark);
        this.deleteStream(bookmark.toJSON());
      }
    },

    deleteStream: function(attributes){
      var stream = this.sources.findWhere({
          format: attributes.format,
          scheme: attributes.scheme,
          host  : attributes.host,
          path  : attributes.path
        });
      
      this.sources.remove(stream);
    },

    toggleBookmarkState: function(e){
      var index =  e.target.getAttribute("data-index");
      var bookmark = this.bookmarks.at(index);
      if (e.target.checked) {
        this.enableBookmark(bookmark);
      } else {
        this.disableBookmark(bookmark);        
      }
    },

    enableBookmark: function(bookmark){
      bookmark.set("enable", true);
      this.sources.add({
        format  : bookmark.get("format"),
        scheme  : bookmark.get("scheme"),
        host    : bookmark.get("host"),
        path    : bookmark.get("path")
      });
    },

    disableBookmark: function(bookmark){
      bookmark.set("enable", false);
      var stream = this.sources.findWhere({
        format  : bookmark.get("format"),
        scheme  : bookmark.get("scheme"),
        host    : bookmark.get("host"),
        path    : bookmark.get("path")
      });
      this.sources.remove(stream);
    },

    toggleAllBookmarks: function(e){
      var checkAll = false;
      if(e.target.checked)
        checkAll = true;

      this.$el.find(".enable-bookmark[type='checkbox']")
      .each(function(index, box){
        box.checked = checkAll;
        var bookmark = this.bookmarks.at(index);
        this.enableBookmark(bookmark);
      }.bind(this));
    },
  });
});
