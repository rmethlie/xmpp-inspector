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
        BaseCollection: "collections/Base.collection",
        BaseModel: "models/Base.model",
        BaseView: "views/Base.view",
        Packet: "models/Packet.model",
        Streams: "collections/Streams.collection",
        Stream: "models/Stream.model",
        StreamsView: "views/Streams.view",
        StreamsManager: "views/StreamsManager.view",
        ResponseListener: "models/ResponseListener.model",
        XMPPStreamView: "views/XMPPStream.view",
        RequestListener: "models/RequestListener.model",
        ResponseListeners: "collections/ResponseListeners.collection",
        RequestListeners: "collections/RequestListeners.collection",
        ChromeConnections: "collections/ChromeConnections.collection",
        NetworkEvent: "models/NetworkEvent.model",
        NetworkEvents: "collections/NetworkEvents.collection",
        StreamToolbarModel: "/javascripts/models/StreamToolbar.model",
        StreamToolbarView: "/javascripts/views/StreamToolbar.view",
        InspectorModel: "/javascripts/models/Inspector.model",
        InspectorView: "/javascripts/views/Inspector.view",
        Panels: "collections/Panels.collection",
        Panel: "models/Panel.model",
        StreamContainer: "lib/codemirror-container",
        BackgroundPage: "models/BackgroundPage.model",
        ExternalListeners: "collections/ExternalListeners.collection",
        ExternalListener: "models/ExternalListener.model",
        ChromeConnection: "models/ChromeConnection.model",
        Bookmarks: "collections/Bookmarks.collection",
        Bookmark: "models/Bookmark.model"
    }
});