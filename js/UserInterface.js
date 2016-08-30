define(function () {
    "use strict";

    var UserInterface = function (layerManager, geojson) {
        this.layerManager = layerManager;
        this.geojson = geojson;
        this.map = {};

    };


    UserInterface.prototype.listeners = function () {
        var self = this;


        $(".slider").slider({
            ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            ticks_snap_bounds: 10,
            value: 0

        });

        $('a').tooltip();

        $('a').click(function () {
            $('a').tooltip('hide');
        })

        $("#submitQuery").click(function () {
            var count = 0;
            var idSlider = [];
            self.geojson.clean();

            $(".name_slider div").each(function () {
                if (this.id) {
                    idSlider.push(this.id);
                    count++;
                }
            });
            var allValues = [];
            $("#criteria_selected").html("");
            idSlider.forEach(function (id, x) {
                idSlider[x] = [];
                var value = $("#" + id).slider().slider('getValue');
                if (Number(value) > 0) {
                    value = (Math.round(value / 10) * 10);
                    idSlider[x].push(id);
                    var name = $("#" + id).parent().find("label").text();
                    var div = '<div class="selected">' + name + ' - <strong>' + value + '%</strong></div>';
                    $("#criteria_selected").append(div);
                    self.geojson.add(id, name);
                    allValues.push([id, value]);
                }

            });

            var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
                'q', 'r','s','t','u','v','w','x','y','z'];

            var queryhead = 'for';
            for (var x = 0; x < allValues.length; x++) {
                queryhead += ' ' + letters[x] + ' in (' + allValues[x][0] + ')';
                if (x < allValues.length - 1) {
                    queryhead += ',';
                }
            }

            console.log(queryhead)

            // query += ' return encode( ( (';
            //
            var plus = encodeURIComponent('+');
            var sum = 0;
            var comparison = '((';
            for (var x = 0; x < allValues.length; x++) {
                 comparison += letters[x] + '*' + allValues[x][1];
                sum += allValues[x][1];
                if (x < allValues.length - 1) {
                    comparison += ''+plus+'';
                } else {
                    comparison += ')/' + sum + ')';
                }
            }

            // query += '), "gtiff") )';

            console.log(comparison)

            // var finalQuery = queryhead +' return encode( (unsigned char) switch case ' + comparison + '= 1 return {red: 255; green: 255; blue: 255}' +
            // ' case 0.7 > '+ comparison +' return {red: 0; green: 0; blue: 255}' +
            // ' case 0.5 > '+ comparison +' return {red: 255; green: 255; blue: 0}' +
            // ' case 0.2 > '+ comparison +' return {red: 255; green: 140; blue: 0}' +
            // ' default return {red: 255; green: 0; blue: 0},  "gtiff")';

            var finalQuery = queryhead +' return encode( (unsigned char) switch case ' + comparison + '= 1 return {red: 215; green: 25; blue: 28}' +
            ' case 0.9 < '+ comparison +' return {red: 231; green: 84; blue: 55}' +
            ' case 0.8 < '+ comparison +' return {red: 246; green: 144; blue: 83}' +
            ' case 0.7 < '+ comparison +' return {red: 249; green: 158; blue: 89}' +
            ' case 0.6 < '+ comparison +' return {red: 254; green: 201; blue: 128}' +
            ' case 0.5 < '+ comparison +' return {red: 255; green: 237; blue: 170}' +
            ' case 0.4 < '+ comparison +' return {red: 237; green: 248; blue: 185}' +
            ' case 0.3 < '+ comparison +' return {red: 199; green: 233; blue: 173}' +
            ' case 0.2 < '+ comparison +' return {red: 157; green: 211; blue: 167}' +
            ' case 0.1 < '+ comparison +' return {red: 157; green: 211; blue: 167}' +
            ' default return {red: 0; green: 0; blue: 0},  "gtiff")';


            console.log(finalQuery)
            self.addLayer(finalQuery);
            //  var data;
            //  $.ajax({
            //  type: "POST",
            //  url: 'http://131.175.143.84/rasdaman74/ows/wcps',
            //  data: {query: query},
            //  success: function (res) {
            //  self.addLayer(res);
            //  data = res
            //  }
            //  });

        });
    };


    UserInterface.prototype.addLayer = function (request) {

        var wcpsEndPoint = 'http://131.175.143.84/rasdaman74/ows?'
        var resourcesUrl = wcpsEndPoint +'query='+ request;

        var geotiffObject = new WorldWind.GeoTiffReader(resourcesUrl);

        var geoTiffImage = geotiffObject.readAsImage(function (canvas) {
          var surfaceGeoTiff = new WorldWind.SurfaceImage(
              geotiffObject.metadata.bbox,
              new WorldWind.ImageSource(canvas)
          );

          var geotiffLayer = new WorldWind.RenderableLayer("GeoTiff");
          geotiffLayer.addRenderable(surfaceGeoTiff);
          wwd.addLayer(geotiffLayer);
          wwd.redraw();
        });
    }

    UserInterface.prototype.convertToshape = function (grid, data) {

        var csv = [];

        data = data.split("},");

        for (var x = 0; x < data.length; x++) {
            var str = data[x].replace(/\{|\}/g, '');
            str = str.split(",");

            for (var y = 0; y < str.length; y++) {

                var temp = Number(str[y]);

                csv.push(temp);

            }
        }


        var self = this;
        //var colors = [[0, 255, 0], [255, 255, 0], [255, 0, 0]];
        var colors = [[141, 193, 197], [255, 237, 170], [215, 25, 28]];

        var rightIndex = 94;
        var topIndex = 85;

        for (var x = 0; x < grid.renderables.length; x++) {

            topIndex--;

            if (topIndex == 0) {
                topIndex = 84;
                rightIndex--;
            }

            var r = grid.renderables[(94 * topIndex) - rightIndex];

            r.pathType = WorldWind.LINEAR;
            r.maximumNumEdgeIntervals = 1;
            var value = csv[x];
            if (!self.map[value]) {

                var col = geojson.getColor(((value - 0) / (100 - 0)) * 100, colors);
                if (value == 0) {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 50);
                } else {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 155);
                }
                self.map[value] = col;
            }
            r._attributes._interiorColor = self.map[value];

        }
        //bbox= xMin, yMin 9.03832,45.3854 : xMax,yMax 9.27921,45.5369

        grid.enabled = true;
        geojson.layerManager.synchronizeLayerList();
    };
    return UserInterface
});
