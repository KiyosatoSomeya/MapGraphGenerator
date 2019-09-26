var map;
var elevationObj;
var node_list = new Array();
var edge_list = new Array();
var selectingNode;

class map_node{
  constructor(index, latitude, longitude, value, info, marker){
    this.index = index;
    this.latitude = latitude;
    this.longitude = longitude;
    this.value = value;
    this.info = info;
    this.marker = marker;
  }
}

class map_edge{
  constructor(node_1_id, node_2_id, value, info){
    this.node_1_id = node_1_id;
    this.node_2_id = node_2_id;
    this.value = value;
    this.info = info;
  }
}

/* center position is Tokyo Institute of Technology */
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

/* set elevation at the inputted latitude and longitude to the input field */
function SetElev(){
  var lat = parseFloat(document.getElementById("latInput").value);
  var lng = parseFloat(document.getElementById("lngInput").value);
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
  var lat = parseFloat(document.getElementById("latInput").value);
  var lng = parseFloat(document.getElementById("lngInput").value);
  var value = parseFloat(document.getElementById("elevInput").value);
  var info = document.getElementById("nodeInfoInput").value;
  var newMarker = new google.maps.Marker({  // set marker to the google map
    position: new google.maps.LatLng(lat, lng),
    map: map
  });

  selectingNode = new map_node(node_list.length, lat, lng, value, info, newMarker);
  node_list.push(selectingNode);

  google.maps.event.addListener(markers, 'click', function(e) {
    SelectNode(selectingNode.index);
  })

  // reset input field
  document.getElementById("latInput").value = "";
  document.getElementById("lngInput").value = "";
  document.getElementById("elevInput").value = "";
  document.getElementById("nodeInfoInput").value = "";
}

function SetNode1(){
  document.getElementById("node1Input").value = String(selectingNode.index);
}

function SetNode2(){
  document.getElementById("node2Input").value = String(selectingNode.index);
}

/* set distance between node 1 and node 2 to the value input field */
function SetDistance(){
  var id_1 = parseInt(document.getElementById("node1Input").value);
  var id_2 = parseInt(document.getElementById("node2Input").value);
  var node_1 = node_list[id_1];
  var node_2 = node_list[id_2];
  var lat_d = node_1.latitude - node_2.latitude;
  var lng_d = node_1.longitude - node_2.longitude;
  var distance = Math.sqrt(lat_d * lat_d + lng_d * lng_d);
  document.getElementById("distanceInput").value = String(distance);
}

function AddEdge(){
  var id_1 = parseInt(document.getElementById("node1Input").value);
  var id_2 = parseInt(document.getElementById("node2Input").value);
  var value = parseFloat(document.getElementById("distanceInput").value);
  var info = document.getElementById("edgeInfoInput").value;
  var newEdge = new map_edge(id_1, id_2, value, info);
  edge_list.push(newEdge);

  // show in the google map
  var node_1 = node_list[id_1];
  var node_2 = node_list[id_2];

  var path = new Array();
  path.push(new google.maps.latLng(node_1.latitude, node_1.longitude));
  path.push(new google.maps.latLng(node_2.latitude, node_2.longitude));
  var polyLineOptions = {
      path: path,
      strokeWeight: 2,
      strokeColor: "#636262",
      strokeOpacity: "0.8"
  };
  var polyLine = new google.maps.Polyline(polyLineOptions);
  polyLine.setMap(map);

}

/* This function is called when a marker on the google map is clicked. */
function SelectNode(index){
  selectingNode = node_list[index];
  alert(String(index) + String(selectingNode.latitude) + string(selectingNode.longitude));
}
