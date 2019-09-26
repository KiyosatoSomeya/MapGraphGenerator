var map;
var elevationObj;
var node_list = new Array();
var edge_list = new Array();
var selectingNode = null;
var autoChangeElevation = false;
var autoChangeDistance = false;
var marker_icon;
var marker_icon_info;
var selected_marker_icon;
var selected_marker_icon_info;
var includeNodeValue = true;
var includeNodeInfo = true;
var includeEdgeValue = true;
var includeEdgeInfo = true;

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
  constructor(node_1, node_2, value, info, polyLine){
    this.node_1 = node_1;
    this.node_2 = node_2;
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

    marker_icon = {
      url: "img/node.png",
      scaledSize: new google.maps.Size(25, 25)
    }
    marker_icon_info = {
      url: "img/node_info.png",
      scaledSize: new google.maps.Size(25, 25)
    }
    selected_marker_icon = {
      url: "img/node_selected.png",
      scaledSize: new google.maps.Size(40, 40)
    }
    selected_marker_icon_info = {
      url: "img/node_selected_info.png",
      scaledSize: new google.maps.Size(40, 40)
    }
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

function ChangeIncludeNodeValue(){
  if(document.getElementById("includeValueCheck").checked){
    includeNodeValue = true;
  }
}

function ChangeIncludeNodeInfo(){
if(document.getElementById("includeInfoCheck").checked){
    includeNodeInfo = true;
  }
}

function ChangeIncludeEdgeValue(){
  if(document.getElementById("includeValueCheck").checked){
    includeEdgeValue = true;
  }
}

function ChangeIncludeEdgeInfo(){
if(document.getElementById("includeInfoCheck").checked){
    includeEdgeInfo = true;
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

  if(isNaN(lat) || isNaN(lng)){
    alert("Error: Incorrect latitude or longitude is detected.");
    return;
  }

  if(isNaN(value)){
    value = 0;
  }

  var newMarker = new google.maps.Marker({  // set marker to the google maps
    position: new google.maps.LatLng(lat, lng),
    animation: google.maps.Animation.DROP,
    icon: selected_marker_icon,
    draggable: true,
    map: map
  });

  SwitchSelectingNode(new Map_node(node_list.length, lat, lng, value, info, newMarker));
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

  SelectDisplay();
}

function SwitchSelectingNode(newSelectingNode){
  // unselect now selecting marker
  if(selectingNode != null){
    if(selectingNode.info == ""){
      selectingNode.marker.setIcon(marker_icon);
    }else{
      selectingNode.marker.setIcon(marker_icon_info);
    }
  }

  selectingNode = newSelectingNode;

  if(selectingNode.info == ""){
    selectingNode.marker.setIcon(selected_marker_icon);
  }else{
    selectingNode.marker.setIcon(selected_marker_icon_info);
  }
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

  if(isNaN(id_1) || isNaN(id_2)){
    alert("Error: Incorrect node ID is detected.");
    return;
  }

  if(isNaN(value)){
    value = 0;
  }

  if(id_1 >= node_list.length || id_1 < 0 || id_2 >= node_list.length || id_2 < 0){
    alert("Error: Inputted node ID is not exist.");
    return;
  }

  // show in the google maps
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

  var newEdge = new Map_edge(node_1, node_2, value, info, polyLine);
  edge_list.push(newEdge);

  // reset input field
  document.getElementById("node1Input").value = "";
  document.getElementById("node2Input").value = "";
  document.getElementById("distanceInput").value = "";
  document.getElementById("edgeInfoInput").value = "";
  SelectDisplay();
}

/* This function is called when a marker on the google maps is clicked. */
function SelectNode(index){
  SwitchSelectingNode(node_list[index]);
  if(selectingNode.info != ""){
    new google.maps.InfoWindow({
            content: selectingNode.info
    }).open(map, selectingNode.marker);
  }
  SelectDisplay();
}

/* This function is called when a marker on the google maps is dragend. */
function MoveNode(index, newLatLng){
  SwitchSelectingNode(node_list[index]);
  selectingNode.latitude = newLatLng.lat();
  selectingNode.longitude = newLatLng.lng();

  // move poly line
  for(var target_edge of edge_list){
    if(target_edge.node_1.index == index || target_edge.node_2.index == index){
      target_edge.polyLine.setMap(null);

      var node_1 = target_edge.node_1
      var node_2 = target_edge.node_2;
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

  // change evaluation
  if(autoChangeElevation){
    var latlng = new google.maps.LatLng(selectingNode.latitude, selectingNode.longitude);
    var request = {locations: new Array(latlng)};
    
    elevationObj.getElevationForLocations(request, function(response, status){
      if(status == google.maps.ElevationStatus.OK){
        selectingNode.value = response[0].elevation;
        SelectDisplay();
      }else{
        SelectDisplay();
        alert("Could not get elevation");
      }
    })
  }else{
    SelectDisplay();
  }
}

function SelectDisplay(){
  if(selectingNode == null){
    document.getElementById("select_id").textContent = "-";
    document.getElementById("select_lat").textContent = "-";
    document.getElementById("select_lng").textContent = "-";
    document.getElementById("select_val").textContent = "-";
    document.getElementById("select_info").textContent = "-";

    document.getElementById("select_edges").innerHTML = "";
  }else{
    var index = selectingNode.index;
    document.getElementById("select_id").textContent = String(index);
    document.getElementById("select_lat").textContent = String(selectingNode.latitude);
    document.getElementById("select_lng").textContent = String(selectingNode.longitude);
    document.getElementById("select_val").textContent = String(selectingNode.value);
    document.getElementById("select_info").textContent = String(selectingNode.info);
    var edges_display = "";
    var edge_count = 0;

    for(var i = 0; i < edge_list.length; i++){
      var target_edge = edge_list[i];
      if(target_edge.node_1.index == index || target_edge.node_2.index == index){
        if(edge_count == 0){
          edge_count++;
        }else{
          // draw line to devide
          edges_display += '<div class="gray_line_thin"></div>'
        }

        edges_display += '<div class="select_panel_left">ID:</div><div class="select_panel_right">'+
        String(target_edge.node_1.index) + '-'+ String(target_edge.node_2.index) +
        '</div><div class="select_panel_left">Value:</div><div class="select_panel_right">'+
        String(target_edge.value)+
        '</div><div class="select_panel_left">Info:</div><div class="select_panel_both">'+
        target_edge.info+
        '</div><button type="button" name="deleteEdgeBtn" class="select_panel_delete_button" onclick="DeleteEdge('+
        String(i)+
        ')">Delete Edge</button>'
      }
    }
    document.getElementById("select_edges").innerHTML = edges_display;
  }
}

/* delete now selecting node */
function DeleteNode(){
  var index = selectingNode.index;
  if(selectingNode == null){
    return;
  }

  if(window.confirm('Delete selected node and including edge(s)?\nID: ' + String(index))){
    // delete edge using target node at first
    for(var i = edge_list.length - 1; i >= 0; i--){
      var target_edge = edge_list[i];
      if(target_edge.node_1.index == index || target_edge.node_2.index == index){
        target_edge.polyLine.setMap(null);
        edge_list.splice(i, 1);
      }
    }

    // then delete target node and update index
    selectingNode.marker.setMap(null);
    node_list.splice(index, 1);

    for(var i = index; i < node_list.length; i++){
      var selectIndex = i;
      node_list[i].index = selectIndex;
      google.maps.event.clearInstanceListeners(node_list[i].marker);
      google.maps.event.addListener(node_list[i].marker, 'click', function(e) {
        SelectNode(selectIndex);
      })
      google.maps.event.addListener(node_list[i].marker, 'dragend', function(e) {
        MoveNode(selectIndex, e.latLng);
      })
    }

    selectingNode = null;
    SelectDisplay();
  }
}

function DeleteEdge(index){
  var target_edge = edge_list[index];
  if(window.confirm('Delete selected edge?\nID: ' + String(target_edge.node_1.index) + '-' + String(target_edge.node_2.index) )){
    target_edge.polyLine.setMap(null);
    edge_list.splice(index, 1);
    SelectDisplay();
  }
}

function DeleteAllNodes(){
  if(window.confirm('Delete all nodes and edges?')){
    selectingNode = null;

    // remove all markers from google maps
    for(var target_node of node_list){
      target_node.marker.setMap(null);
    }
    node_list.length = 0; // remove all node object

    // remove all edges from google maps
    for(var target_edge of edge_list){
      target_edge.polyLine.setMap(null);
    }
    edge_list.length = 0; // remove all edge object
    SelectDisplay();
  }
}

function ExportFile(){
  var result = "latitude,longitude";
  if(includeNodeValue){
    result += ",value";
  }
  if(includeNodeInfo){
    result += ",info";
  }

  for(var target_node of node_list){
    result += "\n" +
    String(target_node.latitude) + "," +
    String(target_node.longitude);

    if(includeNodeValue){
      result += "," + String(target_node.value);
    }
    if(includeNodeInfo){
      result += "," + target_node.info;
    }
  }

  result += "\nid_1,id_2";
  if(includeEdgeValue){
    result += ",value";
  }
  if(includeEdgeInfo){
    result += ",info";
  }

  for(var target_edge of edge_list){
    result += "\n" +
    String(target_edge.node_1.index) + "," +
    String(target_edge.node_2.index);

    if(includeEdgeValue){
      result += "," + String(target_edge.value);
    }
    if(includeEdgeInfo){
      result += "," + String(target_edge.info);
    }
  }

  var blob = new Blob([result], {type: "text/plain"});

  // create and download file
  if(window.navigator.msSaveBlob){
    // IE
    window.navigator.msSaveBlob(blob, "graph.csv");
  }else{
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.target = "_blank";
    link.download = "graph.csv";
    link.click();
    URL.revokeObjectURL();
  }
}

function ImportFile(){

}