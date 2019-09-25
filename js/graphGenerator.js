var map;
var elevationObj;

class map_node{
  constructor(latitude, longitude, elevation, info){
    this.latitude = latitude;
    this.longitude = longitude;
    this.elevation = elevation;
    this.info = info;
  }
}

class map_edge{
  constructor(node_1, node_2, info){
    this.node_1 = node_1;
    this.node_2 = node_2;
    this.info = info;
  }
}

function initMap() {
    var target = document.getElementById('map');

    map = new google.maps.Map(target, {
    center: {lat: 35.605232, lng: 139.683530},
    zoom: 14
    });

    elevationObj = new google.maps.ElevationService();
}

function SetLatLngElev(){
  var latlng = map.getCenter();
  document.getElementById("latInput").value = latlng.lat();
  document.getElementById("lngInput").value = latlng.lng();

  var request = {locations: new Array(latlng)}
  elevationObj.getElevationForLocations(request, function(response, status){
    if(status == google.maps.ElevationStatus.OK){
      document.getElementById("elevInput") = response[0].elevation;
    }else{
      alert("Could not get elevation");
    }
  })
}

