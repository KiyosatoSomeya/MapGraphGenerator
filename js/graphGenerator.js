var map;
var elevationObj;
var node_list = []
var edge_list = []
var selectingNode;

class map_node{
  constructor(index, latitude, longitude, elevation, info, marker){
    this.index = index;
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

function SetLatLng(){
  var latlng = map.getCenter();
  document.getElementById("latInput").value = String(latlng.lat());
  document.getElementById("lngInput").value = String(latlng.lng());
}

function SetElev(){
  var lat = Float.parseFloat(document.getElementById("latInput").value);
  var lng = Float.parseFloat(document.getElementById("lngInput").value);
  var latlng = new google.maps.LatLng(lat, lng);
  var request = {locations: new Array(latlng)};
  elevationObj.getElevationForLocations(request, function(response, status){
    if(status == google.maps.ElevationStatus.OK){
      document.getElementById("elevInput").value = String(response[0].elevation);
    }else{
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

  selectingNode = new map_node(node_list.length, lat, lng, elev, info, newMarker);
  node_list.push(selectingNode);

  google.maps.event.addListener(markers, 'click', function(e) {
    SelectNode(selectingNode.index);
  })

  // reset input field
  document.getElementById("latInput").value = "";
  document.getElementById("lngInput").value = "";
  document.getElementById("elevInput").value = "";
}

function SetNode1(){
  document.getElementById("node1Input").value = String(selectingNode.index);
}

function SetNode2(){
  document.getElementById("node2Input").value = String(selectingNode.index);
}

function 

function AddEdge(){

}

function SelectNode(index){
  selectingNode = node_list[index];
  alert(String(index) + String(selectingNode.latitude) + string(selectingNode.longitude));
}
