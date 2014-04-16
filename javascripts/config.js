require.config({
    baseUrl: "/javascripts/",
    paths: {
        underscore: "bower_components/underscore/underscore",
        jquery: "bower_components/jquery/dist/jquery.min",
        backbone: "bower_components/backbone/backbone",
        text: "bower_components/requirejs-text/text",
        codemirror: "bower_components/codemirror/",
        beautifier: "bower_components/js-beautify/js/lib",
        Utils: "lib/utils",
        BaseModel: "models/Base.model",
        BaseView: "views/Base.view",
        Packet: "models/Packet.model",
        Stream: "models/Stream.model",
        StreamView: "views/Stream.view",
        XMPPStreamView: "views/XMPPStream.view",
        StreamListener: "models/StreamListener.model",
        StreamListeners: "collections/StreamListeners.collection",
        NetworkEvent: "models/NetworkEvent.model",
        NetworkEvents: "collections/NetworkEvents.collection"
    }
});