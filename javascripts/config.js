require.config({
    baseUrl: "/javascripts/",
    paths: {
        underscore: "bower_components/underscore/underscore",
        jquery: "bower_components/jquery/dist/jquery.min",
        backbone: "bower_components/backbone/backbone",
        text: "bower_components/requirejs-text/text",
        codemirror: "bower_components/codemirror/",
        beautifier: "bower_components/js-beautify/js/lib",
        BaseView: "views/Base.view",
        BaseModel: "models/Base.model",
        StreamView: "views/Stream.view",
        XMPPStreamView: "views/XMPPStream.view",
        Packet: "models/Packet.model",
        NetworkRequest: "models/NetworkRequest.model",
        Stream: "models/Stream.model",
        StreamListener: "models/StreamListener.model",
        StreamListeners: "collections/StreamListeners.collection",
        XMPPStreamToolbarModel: "/javascripts/models/XMPPStreamToolbar.model",
        XMPPStreamToolbarView: "/javascripts/views/XMPPStreamToolbar.view"
    }
});