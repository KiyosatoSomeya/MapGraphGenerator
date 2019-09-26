var map;
var elevationObj;
var node_list = new Array();
var edge_list = new Array();
var selectingNode;
var autoChangeElevation = false;
var autoChangeDistance = false;

class Map_node{
  constructor(index, latitude, longitude, value, info, marker){
    this.index = index;
    this.latitude = latitude;
    this.longitude = longitude;
    this.value = value;
    this.info = info;
    this.marker = marker;
  }
}

class Map_edge{
  constructor(node_1_id, node_2_id, value, info, polyLine){
    this.node_1_id = node_1_id;
    this.node_2_id = node_2_id;
    this.value = value;
    this.info = info;
    this.polyLine = polyLine;
  }
}

/* center position is Tokyo Institute of Technology */
function InitMap() {
    var target = document.getElementById('map');

    map = new google.maps.Map(target, {
    center: {lat: 35.605232, lng: 139.683530},
    zoom: 16
    });

    elevationObj = new google.maps.ElevationService();
}

function ChangeAutoElevation(){
  if(document.getElementById("autoElevation").checked){
    autoChangeElevation = true;
  }
}

function ChangeAutoDistance(){
if(document.getElementById("autoDistance").checked){
    autoChangeDistance = true;
  }
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
    animation: google.maps.Animation.DROP,
    draggable: true,
    map: map
  });

  selectingNode = new Map_node(node_list.length, lat, lng, value, info, newMarker);
  node_list.push(selectingNode);

  var index = selectingNode.index;
  google.maps.event.addListener(newMarker, 'click', function(e) {
    SelectNode(index);
  })
  google.maps.event.addListener(newMarker, 'dragend', function(e) {
    MoveNode(index, e.latLng);
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
  var position_1 = new google.maps.LatLng(node_1.latitude, node_1.longitude);
  var position_2 = new google.maps.LatLng(node_2.latitude, node_2.longitude);
  var distance = google.maps.geometry.spherical.computeDistanceBetween(position_1, position_2);
  document.getElementById("distanceInput").value = String(distance);
}

function AddEdge(){
  var id_1 = parseInt(document.getElementById("node1Input").value);
  var id_2 = parseInt(document.getElementById("node2Input").value);
  var value = parseFloat(document.getElementById("distanceInput").value);
  var info = document.getElementById("edgeInfoInput").value;

  // show in the google map
  var node_1 = node_list[id_1];
  var node_2 = node_list[id_2];
  var path = new Array();
  path.push(new google.maps.LatLng(node_1.latitude, node_1.longitude));
  path.push(new google.maps.LatLng(node_2.latitude, node_2.longitude));
  var polyLineOptions = {
      path: path,
      strokeWeight: 6,
      strokeColor: "#636262",
      strokeOpacity: "0.8"
  };
  var polyLine = new google.maps.Polyline(polyLineOptions);
  polyLine.setMap(map);

  var newEdge = new Map_edge(id_1, id_2, value, info, polyLine);
  edge_list.push(newEdge);
}

/* This function is called when a marker on the google map is clicked. */
function SelectNode(index){
  selectingNode = node_list[index];
}

/* This function is called when a marker on the google map is dragend. */
function MoveNode(index, newLatLng){
  selectingNode = node_list[index];
  selectingNode.latitude = newLatLng.lat();
  selectingNode.longitude = newLatLng.lng();

  if(autoChangeElevation){
    var latlng = new google.maps.LatLng(selectingNode.latitude, selectingNode.longitude);
    var request = {locations: new Array(latlng)};
    elevationObj.getElevationForLocations(request, function(response, status){
      if(status == google.maps.ElevationStatus.OK){
        selectingNode.value = response[0].elevation;
      }else{
        alert("Could not get elevation");
      }
    })
  }

  // move poly line
  for(var target_edge of edge_list){
    if(target_edge.node_1_id == index || target_edge.node_2_id == index){
      target_edge.polyLine.setMap(null);

      var node_1 = node_list[target_edge.node_1_id];
      var node_2 = node_list[target_edge.node_2_id];
      var path = new Array();
      path.push(new google.maps.LatLng(node_1.latitude, node_1.longitude));
      path.push(new google.maps.LatLng(node_2.latitude, node_2.longitude));
      var polyLineOptions = {
          path: path,
          strokeWeight: 6,
          strokeColor: "#636262",
          strokeOpacity: "0.8"
      };
      var polyLine = new google.maps.Polyline(polyLineOptions);
      polyLine.setMap(map);
      target_edge.polyLine = polyLine;

      if(autoChangeDistance){
        var position_1 = new google.maps.LatLng(node_1.latitude, node_1.longitude);
        var position_2 = new google.maps.LatLng(node_2.latitude, node_2.longitude);
        var distance = google.maps.geometry.spherical.computeDistanceBetween(position_1, position_2);
        target_edge.value = String(distance);
      }
    }
  }
}


