var map;
var elevationObj;
var node_list = []
var edge_list = []
var selectingNode;

class map_node{
  constructor(latitude, longitude, elevation, info, marker){
    this.latitude = latitude;
    this.longitude = longitude;
    this.elevation = elevation;
    this.info = info;
    this.marker = marker;
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

  var request = {locations: new Array(latlng)}
  elevationObj.getElevationForLocations(request, function(response, status){
    if(status == google.maps.ElevationStatus.OK){
      document.getElementById("latInput").value = String(latlng.lat());
      document.getElementById("lngInput").value = String(latlng.lng());
      document.getElementById("elevInput").value = String(response[0].elevation);
    }else{
      document.getElementById("latInput").value = String(latlng.lat());
      document.getElementById("lngInput").value = String(latlng.lng());
      alert("Could not get elevation");
    }
  })
}

function AddNode(){
  var lat = Float.parseFloat(document.getElementById("latInput").value);
  var lng = Float.parseFloat(document.getElementById("lngInput").value);
  var elev = Float.parseFloat(document.getElementById("elevInput").value);
  var info = document.getElementById("infoInput").value;
  var newMarker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    map: map
  });

  node_list.push(new map_node(lat, lng, elev, info, newMarker));

  google.maps.event.addListener(markers, 'click', function(e) {
    SelectNode(node_list.length - 1);
  })

  // reset input field
  document.getElementById("latInput").value = "";
  document.getElementById("lngInput").value = "";
  document.getElementById("elevInput").value = "";
}

function AddEdge(){

}

function SelectNode(index){
  selectingNode = node_list[index];
  alert(String(index) + String(selectingNode.latitude) + string(selectingNode.longitude));
}
