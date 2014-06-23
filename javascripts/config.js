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
        ResponseListener: "models/ResponseListener.model",
        ResponseListenerView: "views/ResponseListener.view",
        XMPPStreamView: "views/XMPPStream.view",
        RequestListener: "models/RequestListener.model",
        RequestListeners: "collections/RequestListeners.collection",
        NetworkEvent: "models/NetworkEvent.model",
        NetworkEvents: "collections/NetworkEvents.collection",
        StreamToolbarModel: "/javascripts/models/StreamToolbar.model",
        StreamToolbarView: "/javascripts/views/StreamToolbar.view",
        InspectorView: "/javascripts/views/Inspector.view",
        Panels: "collections/Panels.collection",
        Panel: "models/Panel.model",
        BackgroundPage: "models/BackgroundPage.model",
        io: "https://streamshare.io/socket.io/socket.io-1.0.4"
    }
});