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
      "click .close": "close",
      "click .cancel": "cancelEditStream",
      "click .delete": "deleteBookmark",
      "click .add-new .show": "showAddInput",
      "submit .new-url-pattern": "addBookmark",
      "click .edit-stream .show": "toggleEditStream",
      "submit .update-url-pattern": "editStream",
      "click .enable-bookmark": "toggleBookmarkState"
    },

    initialize: function(options){
      if(!options)
        options = {};
      
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
      this.$el.html(this.template({sources: this.sources}));
      var list = this.renderBookmarks(options);
      this.$el.find("#stream-manager-list").append(list);
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
      this.listenTo(this.bookmarks, "add remove reset", function(bookmark, collection, eventData){
        this.render();
        // if(eventData.add){
        //   this.sources.add({
        //     scheme: bookmark.get("scheme"),
        //     host  : bookmark.get("host"),
        //     path  : bookmark.get("path")
        //   });
        // }

        // if(eventData.remove){
        //   var stream = this.bookmarks.findWhere({
        //     scheme: bookmark.get("scheme"),
        //     host  : bookmark.get("host"),
        //     path  : bookmark.get("path")
        //   });
        //   this.bookmarks.remove(stream);
        // }
      });
    },

    showAddInput: function(e){
      console.log("showAddInput");
      var $form = this.$el.find(".add-new .new-url-pattern");
      $form.removeClass("hidden");
      $form.find('.scheme').focus();
    },

    addBookmark: function(e){
      Utils.stopEvent(e);
      if(!e.target)
        return;

      var $form  = $(e.target)
      var data = this.scrubPattern({
        scheme: $form.find('.scheme').val(),
        host  : $form.find('.host').val(),
        path  : $form.find('.path').val()
      });

      if(data)
        this.bookmarks.add(data);
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
      this.inspectorView.toggleManager();
    },

    editStream: function(e){
      Utils.stopEvent(e);
      var index = e.target.getAttribute('data-index');
      var $form = $(this.$el.find("form[data-index='" + index + "']")[0]);
      var $link = $(this.$el.find("a.show[data-index='" + index + "']")[0]);

      var urlParams = this.scrubPattern({
        scheme: $form.find('.scheme').val(),
        host  : $form.find('.host').val(),
        path  : $form.find('.path').val()
      });

      if(urlParams){
        $link.html(urlParams.scheme + "://" + urlParams.host +"/" + urlParams.path);
        this.sources.at(index).set(urlParams);
        this.toggleEditStream(e);
        this.trigger("change:url", urlParams);
      }else{
        this.highlightError(index);
      }

    },

    highlightError: function(){
      console.log("highlightError");
    },

    cancelEditStream: function(e){
      this.toggleEditStream(e);
      this.toggleEditStream(e);
    },

    toggleEditStream: function(e){
      console.log("toggleEditStream");      
      var index =  e.target.getAttribute("data-index");
      var $form = $(this.$el.find("form[data-index='" + index + "']")[0]);
      var $link = $(this.$el.find("a.show[data-index='" + index + "']")[0]);
      if($link.hasClass("hidden")){
        $link.removeClass("hidden");
        $form.addClass("hidden");
      } else {
        $link.addClass("hidden");
        $form.removeClass("hidden");
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
        // this.sources.add(bookmark.toJSON());        
        this.sources.add({
          scheme: bookmark.get("scheme"),
          host  : bookmark.get("host"),
          path  : bookmark.get("path")
        });

      } else {
        var stream = this.sources.findWhere({
          scheme: bookmark.get("scheme"),
          host  : bookmark.get("host"),
          path  : bookmark.get("path")
        });
        this.sources.remove(stream);
      }
    },

  });
});
