define(['BaseModel'], function(BaseModel) {
  "use strict";

  // Description: A Request instance represents entire lifecycle of Network request
  //  including the response.
  var
  iqRegex = /<iq/i,
  messageRegex = /<message/i,
  presenceRegex = /<presence/i,
  //"<body xmlns='http://jabber.org/protocol/httpbind' xmlns:stream='http://etherx.jabber.org/streams' ack='3259642237' ></body>"
  ackRegexp = /<body.+><\/body>/;

  return BaseModel.extend({

    initialize: function(){
    },

    getXMPPStanzaType: function(){
      var
      body = this.get("body");
      switch( true ){

        case iqRegex.test( body ):
          return "<iq>";
        break;

        case messageRegex.test( body ):
          return "<message>";
        break;

        case presenceRegex.test( body ):
          return "<presence>";
        break;

        case  ackRegexp.test( body ):
          return "<body 'ack'>";
        break;

        default: 
          return "Unknown: " + body;
        break;
      }
    }

  });
});
