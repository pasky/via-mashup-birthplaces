// Použití mapy.cz podle jejich příkladů

var obrazek = "http://api4.mapy.cz/img/api/marker/drop-red.png";
var m, vrstva, souradnice = [];

function initMap(json) {
	var options = {
		minZoom: 2
	};
	m = new SMap(JAK.gel("m"), null, 2, options);
	m.addControl(new SMap.Control.Sync()); /* Aby mapa reagovala na změnu velikosti průhledu */
	m.addDefaultControls();

	m.addDefaultLayer(SMap.DEF_BASE).enable(); /* Turistický podklad */

	vrstva = new SMap.Layer.Marker();      /* Vrstva se značkami */
	m.addLayer(vrstva);                    /* Přidat ji do mapy */
	vrstva.enable();                       /* A povolit */
}

function addToMap(res) {
	console.log(res);
	var c = SMap.Coords.fromWGS84(res.lon.value, res.lat.value);

	var options = {
		url: obrazek,
		title: res.name.value,
		anchor: {left: Math.random()*10, bottom: Math.random()*10}  /* Zatřes se značkou, aby se více značek na jednom místě 100% nepřekrývalo */
	}

	var znacka = new SMap.Marker(c, null, options);
	souradnice.push(c);
	vrstva.addMarker(znacka);

	var cz = m.computeCenterZoom(souradnice); /* Spočítat pozici mapy tak, aby značky byly vidět */
	m.setCenterZoom(cz[0], cz[1]);
}


function dbpQuery(name) {
	var url = "http://dbpedia.org/sparql";

	var movie_query = "PREFIX dbpont: <http://dbpedia.org/ontology/>" +
		    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +
		    "SELECT ?name ?lat ?lon WHERE {" +
		    "  ?movie rdfs:label \""+name+"\"@en ;" +
		    "         dbpont:starring ?actor ." +
		    "  ?actor rdfs:label ?name ;" +
		    "         dbpont:birthPlace ?place ." +
		    "  ?place " +
		    "     <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat ;" +
		    "     <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?lon ." +
		    "  FILTER(LANGMATCHES(LANG(?name), \"en\"))" +
		    "}";
	var award_query = "PREFIX dbpont: <http://dbpedia.org/ontology/>" +
		    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +
		    "SELECT ?name ?lat ?lon WHERE {" +
		    "  ?award rdfs:label \""+name+"\"@en ." +
		    "  ?person rdfs:label ?name ;" +
		    "         dbpont:award ?award ;" +
		    "         dbpont:birthPlace ?place ." +
		    "  ?place " +
		    "     <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat ;" +
		    "     <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?lon ." +
		    "  FILTER(LANGMATCHES(LANG(?name), \"en\"))" +
		    "}";
	var aircraft_query = "PREFIX dbpprop: <http://dbpedia.org/property/>" +
		    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +
		    "SELECT ?name ?lat ?lon WHERE {" +
		    "  ?aircraft rdfs:label \""+name+"\"@en ." +
		    "  ?accident rdfs:label ?name ;" +
		    "         dbpprop:aircraftType ?aircraft ;" +
		    "         dbpprop:origin ?place ." +
		    "  ?place " +
		    "     <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat ;" +
		    "     <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?lon ." +
		    "  FILTER(LANGMATCHES(LANG(?name), \"en\"))" +
		    "}";
	console.log(award_query);
	var queryUrl = url+"?query="+encodeURIComponent(award_query)+"&format=json";
	$.ajax({
		dataType: "jsonp",
		url: queryUrl,
		success: function(_data) {
			var results = _data.results.bindings;
			vrstva.removeAll();
			souradnice = [];
			for (var j in results) {
				addToMap(results[j]);
			}
		}
	});
}

$(document).ready(function() {
	initMap();
	//dbpQuery('Seven (1995 film)');
	//dbpQuery('Boeing 777');
	//$('#find').click(function(e) { dbpQuery($('#text').val()); return false; });
	$('#findform').submit(function(e) { dbpQuery($('#text').val()); return false; });
});
