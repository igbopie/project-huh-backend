function initialize() {
    var longitude = $("#map_canvas").data("longitude");
    var latitude = $("#map_canvas").data("latitude");

    var mapCanvas = document.getElementById('map_canvas');
    var mapOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        /*streetViewControl: false,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP]
        },*/
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        zoomControl: false,
        disableDefaultUI: true
    }

    var map = new google.maps.Map(mapCanvas, mapOptions);

    var iconBase = '/images/';

    var image = {
        url: iconBase + 'mapicon_alien.png',
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
    };

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map,
        //icon: iconBase + 'mapicon_alien.png'
        icon:image
    });

}


google.maps.event.addDomListener(window, 'load', initialize);