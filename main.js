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

	// parse string: Point(1234 5678)
	var sppos = res.pos.value.indexOf(' ');
	var lat = res.pos.value.substring(6, sppos);
	var lon = res.pos.value.substring(sppos+1, res.pos.value.length-1);

	var c = SMap.Coords.fromWGS84(lon, lat);

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


function wdQuery(name) {
	var url = "https://query.wikidata.org/bigdata/namespace/wdq/sparql";

	var award_query =
		"PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n" +
		"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
		"SELECT DISTINCT ?name ?pos WHERE {\n" +
		"  ?award rdfs:label \"" + name + "\"@en .\n" +
		"  ?person wdt:P166 ?award . # award received\n" +
		"  ?person wdt:P19 ?place . # birth place\n" +
		"  ?person rdfs:label ?name . filter(langmatches(lang(?name), \"en\"))\n" +
		"  ?place wdt:P625 ?pos . # coordinate locations\n" +
		"}";
	console.log(award_query);
	var queryUrl = url+"?query="+encodeURIComponent(award_query)+"&format=json";
	$.ajax({
		dataType: "json",
		url: queryUrl,
		success: function(_data) {
			console.log(_data);
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
	$('#findform').submit(function(e) { wdQuery($('#text').val()); return false; });
});
