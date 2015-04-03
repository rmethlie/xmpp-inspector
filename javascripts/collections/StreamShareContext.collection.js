define(['jquery','underscore','backbone', 'Context', 'PageContext','SelectionContext','LinkContext'], 
function($,_,Backbone, Context, PageContext, SelectionContext, LinkContext ){

  return Backbone.Collection.extend({

    defaultContexts: [
      new PageContext(),
      new SelectionContext(),
      new LinkContext()//,
      // "editable",
      // "image",
      // "video",
      // "audio"
    ],

    initialize: function(){

      // listen for all menu/submenu clicks here.
      chrome.contextMenus.onClicked.addListener( this.onClicked.bind(this) );

      this.id = 'streamshare-context-item';
      
      // create top level button...
      // then, upon callback success, set up menu/submenus
      this.menuItemId = chrome.contextMenus.create( this.getConfig(), this.createSubContexts.bind(this) );

      console.log( '[StreamShareContext] Initialized.' );
    },

    createSubContexts: function(){
      _.each( this.defaultContexts, function( context ){
        
        try{
          
          // create the menu item with model's config recipe.
          context.id = chrome.contextMenus.create( context.getConfig(this.menuItemId) );

          // store it for looping all and such.
          this.add( context );

          console.log('[StreamShareContext] Added \'' + context.get('title') + '\'' + '[' + context.id + '] to the StreamShare context menu.'  );
        }catch( e ){
          debugger;
        }

      }.bind(this));
    },

    defaultContextHandler: function( clickEvent, tab ){
      console.log( '[StreamShareContext] Top level click event.', clickEvent, tab );
    },

    onClicked: function( clickEvent ){
      var
      context = this.get( clickEvent.menuItemId );
      if( context ){
        context.onClick.apply( context, arguments );
      }else{
        this.defaultContextHandler.apply( this, arguments );
      }
    },

    getConfig: function(){
      return {
        id: this.id,
        title: 'StreamShare',
        contexts: ['all']
      }
    }

  });

});