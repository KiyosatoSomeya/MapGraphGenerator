var map;
function initMap() {
    var target = document.getElementById('map');

    map = new google.maps.Map(target, {
    center: {lat: 35.605232, lng: 139.683530},
    zoom: 14
    });
}