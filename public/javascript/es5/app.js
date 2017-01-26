'use strict';

var secondsCount = void 0;
var ubicacion = 'caba';
var archivo = 'public/source/caba.json';
var updateHistory = void 0;
var getExecute = 0;
var arrData = void 0;
var position = 40;

// Funciones Globales
var ubicationUpdate = function ubicationUpdate(ubication) {
  ubicacion = ubication;
  archivo = 'public/source/' + ubication + '.json';
};
var formatDate = function formatDate(date) {
  return date > 9 ? date : '0' + date;
};
var createObjectDate = function createObjectDate() {
  var roundMinutes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var roundSeconds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var dateObj = {};
  dateObj.date = new Date();
  dateObj.year = dateObj.date.getFullYear();
  dateObj.month = formatDate(dateObj.date.getMonth() + 1);
  dateObj.day = formatDate(dateObj.date.getDate());
  dateObj.hour = formatDate(dateObj.date.getHours());
  dateObj.minute = roundMinutes === false ? formatDate(dateObj.date.getMinutes()) : formatDate(dateObj.date.getMinutes()).toString().slice(0, 1) + '0';
  dateObj.second = roundSeconds === false ? formatDate(dateObj.date.getSeconds()) : '00';

  return dateObj;
};
var sizeObject = function sizeObject(obj) {
  var size = 0;
  var key = void 0;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      size++;
    }
  }

  return size;
};
var getResponsive = function getResponsive(max) {
  return $(window).outerWidth() < max ? true : false;
};

$(document).ready(function () {
  var ejecutarClima = function ejecutarClima() {
    var getWeather = function getWeather(updateTemp) {
      var url = 'https://sheetsu.com/apis/v1.0/790070be9227';

      $.get(url, function (data) {
        var clima = parseFloat(data[10]['']) + ' \xBAC';
        console.log(clima); // Entorno de desarrollo
        updateTemp(clima);
      });
    };
    var updateWeather = function updateWeather(temp) {
      secondsCount = 0; // Reset Timer Update

      d3.select('#temp-weather').text(temp);
    };

    getWeather(updateWeather);
    setInterval(function () {
      getWeather(updateWeather);
    }, 1000 * 60 * 60);
  };
  var ejecutarReloj = function ejecutarReloj() {
    var updateClock = function updateClock() {
      var dateObj = createObjectDate(false, false);

      secondsCount++;

      if (secondsCount % 2 === 0) {
        $('#time').empty().append(dateObj.hour + '<span>:</span>' + dateObj.minute);
      } else {
        $('#time').empty().append(dateObj.hour + '<span class="transparent">:</span>' + dateObj.minute);
      }
    };
    var updateStateClock = function updateStateClock(seconds) {
      var minutes = Math.floor(seconds / 60);

      if (minutes === 0) {
        d3.select('#actualizacion').text('ACTUALIZADO');
      } else if (minutes === 1) {
        d3.select('#actualizacion').text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTO');
      } else {
        d3.select('#actualizacion').text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTOS');
      }
    };

    setInterval(function () {
      updateClock();
      updateStateClock(secondsCount);
    }, 1000);
  };
  var ejecutarRadiacion = function ejecutarRadiacion() {
    var radiation = {
      max: 11,
      min: 0,
      now: 0,
      diameter: $('#medidor').outerWidth(),
      anchor: 15,
      states: {
        extrem: {
          name: 'Peligroso',
          color: 'rgba(85, 50, 133, 1)',
          recomendation: 'Evita exponerte al sol',
          position: 4,
          minValue: 11,
          lvl: 6
        },
        very: {
          name: 'Muy Alto',
          color: 'rgba(242, 56, 90, 1)',
          recomendation: 'Evita exponerte al sol',
          position: 3,
          minValue: 8,
          lvl: 6
        },
        higth: {
          name: 'Alto',
          color: 'rgba(255, 129, 64, 1)',
          recomendation: 'Necesitas protección solar extra',
          position: 2,
          minValue: 6,
          lvl: 4
        },
        moderate: {
          name: 'Moderado',
          color: 'rgba(255, 187, 66, 1)',
          recomendation: 'Buscá sombra y usa protección solar',
          position: 1,
          minValue: 3,
          lvl: 3
        },
        low: {
          name: 'Bajo',
          color: 'rgba(2, 213, 122, 1)',
          recomendation: 'Podés estar al aire libre con mínima protección',
          position: 0,
          minValue: 0.1,
          lvl: 2
        },
        hide: {
          name: 'Sin Radiación',
          color: 'rgba(77, 77, 77, 1)',
          recomendation: 'En este momento no hay niveles de radiación detectados',
          position: -1,
          minValue: 0,
          lvl: 0
        }
      }
    };
    var medidorDinamico = void 0;
    var medidor = void 0;
    var escala = void 0;
    var history = {
      'margin': { top: 50, right: 50, bottom: 40, left: 50 },
      'ranges': {},
      'axis': {}
    };

    var stateRadiation = function stateRadiation(radValue, attr) {

      for (var state in radiation.states) {
        if (radValue >= radiation.states[state].minValue) {
          return radiation.states[state][attr];
        }
      }
    };
    var crearSeccionRadiacionUv = function crearSeccionRadiacionUv() {
      var contenedorMedidor = d3.select('#medidor');

      escala = d3.scaleLinear().domain([radiation.min, radiation.max]).range([5, radiation.max]);
      medidor = function medidor(valor) {
        return d3.arc().outerRadius(radiation.diameter / 2).innerRadius(radiation.diameter / 2 - radiation.anchor).startAngle(Math.PI / 4 * 5).endAngle(Math.PI / 4 * valor).cornerRadius(radiation.anchor);
      };

      var medidorEstatico = medidor(escala(radiation.max));
      medidorDinamico = medidor(escala(radiation.now <= 11 ? radiation.now : 11));

      var svg = contenedorMedidor.append('svg').attr('id', 'svgMedidor')
      // .attr('viewBox', () => `0 0 ${ (radiation.diameter) } ${ (radiation.diameter - ((radiation.diameter / 2) * 0.29289)) }`)
      .attr('viewBox', function () {
        return '0 0 ' + radiation.diameter + ' ' + radiation.diameter;
      });
      svg.append('path') // Medidor Estatico
      .attr('d', medidorEstatico()).attr('class', 'staticMeasure').attr('style', function () {
        // Compatible

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -ms-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);';
      });
      svg.append('svg:path') // Medidor Dinamico
      .attr('id', 'dynamic').attr('d', medidorDinamico()).attr('style', function () {
        // Compatible

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -ms-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);';
      });
      svg.append('svg:text') // Texto UV
      .attr('class', 'measureText').attr('style', function () {
        // Compatible

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 3.5 + 'px);\n                  -ms-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 3.5 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 3.5 + 'px);';
      }).text('UV');
      svg.append('svg:text') // vMin
      .attr('class', 'measureMinMax').attr('style', function () {
        // Compatible

        return 'transform: translate(' + radiation.diameter / 8 * 0.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -ms-transform: translate(' + radiation.diameter / 8 * 0.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 8 * 0.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);';
      }).text('0');
      svg.append('svg:text') // vMax
      .attr('class', 'measureMinMax').attr('style', function () {
        // Compatible

        return 'transform: translate(' + radiation.diameter / 8 * 7.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -ms-transform: translate(' + radiation.diameter / 8 * 7.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 8 * 7.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);';
      }).text('11+');
      svg.append('svg:text') // Estado
      .attr('id', 'state').attr('style', function () {
        // Compatible

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 5.4 + 'px);\n                  -ms-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 5.4 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 5.4 + 'px);';
      }).text(stateRadiation(radiation.now, 'name'));
      svg.append('svg:text') // Valor
      .attr('id', 'lvlRadiation').attr('style', function () {
        // Compatible

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 6.3 + 'px);\n                  -ms-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 6.3 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 6.3 + 'px);';
      }).text(radiation.now);

      // svg.append('svg:circle')  // Punto
      //   .attr('id', 'medidorCircle')
      //   .style('r', (radiation.anchor / 4))
      //   .style('transform', () => {
      //     let x = (radiation.diameter / 2);
      //     let y = (radiation.diameter / 2);
      //
      //     let diametro = radiation.diameter;
      //     let radio = radiation.diameter / 2;
      //
      //     let angulo = (Math.PI / 4) * radiation.now;
      //
      //     console.log('Resultado en X');
      //     console.log((radiation.diameter / 2));
      //     console.log('Resultado en Y');
      //     console.log((radiation.diameter / 2));
      //
      //     return (`translate(${ x }px, ${ y }px)`);
      //   });

      d3.select('#recomendation').text(stateRadiation(radiation.now, 'recomendation'));
      d3.select('#sectionIzq').style('background-color', stateRadiation(radiation.now, 'color'));
    };
    var updateSeccionRadiacionUv = function updateSeccionRadiacionUv() {
      // Reset Timer Update
      secondsCount = 0;

      medidorDinamico = medidor(escala(radiation.now <= 11 ? radiation.now : 11));

      d3.select('#dynamic').attr('d', medidorDinamico()); // Medidor
      d3.select('#lvlRadiation').text(radiation.now); // Valor
      d3.select('#state').text(stateRadiation(radiation.now, 'name')); // Estado
      d3.select('#recomendation').text(stateRadiation(radiation.now, 'recomendation')); // Recomendacion
      d3.select('#sectionIzq').transition().style('background-color', stateRadiation(radiation.now, 'color')); // Color Fondo
    };
    var updateRecomendation = function updateRecomendation() {
      var container = $('.protection-icon');
      var protectionLvl = stateRadiation(radiation.now, 'lvl');

      container.each(function (k, v) {

        var element = container.eq(k).attr('id').split('_')[1];

        if (element <= protectionLvl) {

          container.eq(k).children('.svgStroke').css({ 'stroke': stateRadiation(radiation.now, 'color') });
          container.eq(k).children('.svgFill').css({ 'fill': stateRadiation(radiation.now, 'color') });
          container.eq(k).parent().children('span').css({ 'color': 'black' });
        } else {
          container.eq(k).children('.svgStroke').css({ 'stroke': 'silver' });
          container.eq(k).children('.svgFill').css({ 'fill': 'silver' });
          container.eq(k).parent().children('span').css({ 'color': 'silver' });
        }
      });
    };
    var standarDate = function standarDate(dato) {
      // console.log(dato);
      var fecha = dato.fecha.split('-');
      var hora = dato.hora.split(':');

      var datoFecha = new Date(fecha[2] + '/' + fecha[1] + '/' + fecha[0] + ' ' + hora[0] + ':' + hora[1] + ':' + hora[2]);
      datoFecha.setHours(datoFecha.getHours() - 3);

      dato.fecha = formatDate(datoFecha.getDate()) + '-' + formatDate(datoFecha.getMonth() + 1) + '-' + datoFecha.getFullYear();
      dato.hora = formatDate(datoFecha.getHours()) + ':' + formatDate(datoFecha.getMinutes()) + ':' + formatDate(datoFecha.getSeconds());

      return dato;
    };
    var getRadiation = function getRadiation(radiacion, recomendation, history) {
      var force = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var dateObj = createObjectDate(true, true);

      getExecute++;

      if (getExecute > 30 || force) {

        $.get(archivo, function (data) {
          arrData = data.datosRecientes[0].indiceUV;

          radiation.now = arrData[arrData.length - 1].indiceUV;

          arrData.forEach(function (v, k) {
            v = standarDate(v);
          });

          if (radiation.now === '0.0') {
            d3.select('#section1 .sectionContent').attr('class', 'sectionContent fondoNoche');
            d3.select('#section3').attr('class', 'footerNoche');
            d3.select('#section1 .encabezado').attr('class', 'encabezado noche');

            $('#ubicaciones').attr('class', function () {
              if (radiation.now == 0) {
                return 'ubicacionNoche';
              } else {
                return 'ubicacionDia';
              }
            });

            $('.iconos-derecha').hide();
            $('.iconos-izquierda').hide();
          } else {
            d3.select('#section1 .sectionContent').attr('class', 'sectionContent fondoDia');
            d3.select('#section3').attr('class', 'footerDia');
            d3.select('#section1 .encabezado').attr('class', 'encabezado dia');

            $('#ubicaciones').attr('class', function () {
              if (radiation.now == 0) {
                return 'ubicacionNoche';
              } else {
                return 'ubicacionDia';
              }
            });

            $('.iconos-derecha').show();
            $('.iconos-izquierda').show();
          }

          console.log('Se hace pedido GET');
          radiacion();
          recomendation();
          history(arrData);

          getExecute = 0;
        });
      } else {

        radiation.now = arrData[arrData.length - 1].indiceUV;

        console.log('Se accede a variable');
        radiacion();
        recomendation();
        history(arrData);
      }
    };
    var convertElement = function convertElement(element) {
      // console.log(element);
      var fecha = element.fecha.split('-');
      var date = formatDate(fecha[2]) + '/' + formatDate(fecha[1]) + '/' + formatDate(fecha[0]) + ' ' + element.hora;

      return date;
    };
    // const processHistory = (data) => {
    //   let date = new Date();
    //   // console.log(data.length); // ERROR
    //   let aux = data;
    //
    //   let lastElement = convertElement(aux[aux.length - 1]);
    //
    //   while (lastElement > date) {
    //     aux.pop();
    //     lastElement = convertElement(aux[aux.length - 1]);
    //   }
    //   // console.log(data.length);
    //   return aux;
    // };
    var createHistory = function createHistory(data) {
      history.container = d3.select('#lineChart');
      history.width = history.container.node().getBoundingClientRect().width - history.margin.left - history.margin.right;
      history.height = history.container.node().getBoundingClientRect().height - history.margin.top - history.margin.bottom;

      var dataset = data;

      // Set the ranges
      history.ranges.x = d3.scaleTime().domain([new Date(convertElement(dataset[0])), new Date()]).range([0, history.width]);
      history.ranges.y = d3.scaleLinear().domain([0, 13]).range([history.height, 0]);

      // Funciones
      history.graphAxis = function (svgElemento, axis, axisName, axisValue) {
        var index = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;


        if ($('#' + axisValue)) {
          $('#' + axisValue).remove();
        }

        if (axisValue === 'x') {
          var element = svgElemento.append('svg:g').attr('id', axisName).attr('class', 'x axis').attr('style', function () {
            // Compatible

            return 'transform: translate(0px, ' + history.height + 'px);\n                      -ms-transform: translate(0px, ' + history.height + 'px);\n                      -webkit-transform: translate(0px, ' + history.height + 'px);';
          }).call(axis);
          if (index === true) {
            element.append('svg:text').attr('class', 'xIndex').attr('style', function () {
              // Compatible

              return 'transform: translate(' + history.width + 'px, 35px);\n                        -ms-transform: translate(' + history.width + 'px, 35px);\n                        -webkit-transform: translate(' + history.width + 'px, 35px);';
            }).text('TIEMPO');
          }
        } else {
          var _element = svgElemento.append('svg:g').attr('id', axisName).attr('class', 'y axis').attr('style', function () {
            // Compatible

            return 'transform: translate(-20px, 0px);\n                      -ms-transform: translate(-20px, 0px);\n                      -webkit-transform: translate(-20px, 0px);';
          }).call(axis);
          if (index === true) {
            _element.append('svg:text').attr('class', 'yIndex').text('UV');
          }
        }
      };
      history.axisFactory = function (nameAxis) {
        var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


        var axisCreate = void 0;

        var textDay = d3.timeFormat('%a');
        var numberDay = d3.timeFormat('%d');
        var month = d3.timeFormat('%b');

        switch (nameAxis) {
          case '12hours':
            axisCreate = d3.axisBottom(history.ranges.x).ticks(d3.timeHour.every(12)).tickFormat(d3.timeFormat('%H:%M')).tickSizeInner(-history.height).tickSizeOuter(0).tickPadding(padding);
            break;
          case '24hours':
            axisCreate = d3.axisBottom(history.ranges.x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat('%H:%M')).tickSizeInner(-history.height).tickSizeOuter(0).tickPadding(padding);
            break;
          case 'fullDate':
            axisCreate = d3.axisBottom(history.ranges.x).ticks(d3.timeDay.every(1)).tickFormat(function (d) {
              return textDay(d) + '. ' + numberDay(d) + ' ' + month(d);
            }).tickSizeInner(0).tickSizeOuter(0).tickPadding(padding);
            break;
          case 'partDay':
            axisCreate = d3.axisBottom(history.ranges.x).ticks(d3.timeDay.every(1)).tickFormat(function (d) {
              return '' + numberDay(d);
            }).tickSizeInner(0).tickSizeOuter(0).tickPadding(padding);
            break;
          case 'month':
            axisCreate = d3.axisBottom(history.ranges.x).ticks(d3.timeDay.every(1)).tickFormat(function (d) {
              return '' + month(d);
            }).tickSizeInner(0).tickSizeOuter(0).tickPadding(padding);
            break;
          case 'axisY':
            axisCreate = d3.axisLeft(history.ranges.y).tickPadding(0).tickSizeInner(0).tickSizeOuter(0).tickValues([0, 3, 6, 8, 11]);
            break;
        }

        return axisCreate;
      };

      history.axis.yAxis = history.axisFactory('axisY', null);

      if ($(window).outerWidth() > 600) {
        history.axis.xAxisLine1 = history.axisFactory('12hours', 10);
        history.axis.xAxisLine2 = history.axisFactory('fullDate', 30);
      } else {
        history.axis.xAxisLine1 = history.axisFactory('month', 10);
        history.axis.xAxisLine2 = history.axisFactory('partDay', 30);
      }

      // Define the line
      history.line = d3.line().curve(d3.curveBasis).x(function (d, i) {
        return history.ranges.x(new Date(convertElement(d)));
      }).y(function (d, i) {
        return history.ranges.y(d.indiceUV);
      });
      history.svg = history.container.append('svg:svg').attr('id', 'historyChart').attr('height', '100%').attr('weigth', '100%').attr('viewBox', function () {
        var width = history.width + history.margin.left + history.margin.right;
        var height = history.height + history.margin.top + history.margin.bottom;
        var viewBox = '0 0 ' + width + ' ' + height;

        return viewBox;
      });
      history.defs = history.svg.append('svg:defs');
      history.defs.append('svg:pattern').attr('id', 'image').attr('x', 0).attr('y', 0).attr('patternUnits', 'userSpaceOnUse').attr('height', '100%').attr('width', '100%').append('svg:image').attr('id', 'mascara').attr('y', history.margin.top).attr('x', 0).attr('xlink:href', 'public/img/gradient.svg').attr('width', function () {
        return history.width;
      }).attr('height', function () {
        return history.height;
      });
      history.graph = history.svg.append('svg:g').attr('style', function () {
        // Compatible
        return 'transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -ms-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -webkit-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);';
      });

      history.graphAxis(history.graph, history.axis.xAxisLine1, 'xAxisLine1', 'x', true);
      history.graphAxis(history.graph, history.axis.xAxisLine2, 'xAxisLine2', 'x', false);
      history.graphAxis(history.graph, history.axis.yAxis, 'yAxis', 'y', true);

      history.graph.append('path').attr('id', 'lineChartGraph').attr('d', history.line(dataset)).attr('stroke', 'url(#image)').attr('stroke-linejoin', 'round').attr('stroke-width', '0.5rem');

      var tooltip = history.svg.append('g').attr('id', 'tooltip').attr('class', 'hide');
      var rect = tooltip.append('rect').attr('class', 'toolRect');
      var text = tooltip.append('text').attr('class', 'toolText');
      var focus = tooltip.append('circle').attr('class', 'toolCircle');

      history.voronoi = d3.voronoi().x(function (d) {
        return history.ranges.x(new Date(convertElement(d)));
      }).y(function (d) {
        return history.ranges.y(d.indiceUV);
      }).extent([[0, 0], [history.width, history.height]]);
      history.voronoiGroup = history.svg.append('g').attr('class', 'voronoi').attr('style', function () {
        // Compatible
        return 'transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -ms-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -webkit-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);';
      });

      history.voronoiGroup.selectAll('path').data(history.voronoi(dataset).polygons()).enter().append('path').attr('d', function (d) {
        if (d) {
          return 'M' + d.join('L') + 'Z';
        }
      }).on('mouseover', function (d) {
        var date = new Date(convertElement(d.data));

        tooltip.attr('class', '').attr('style', function () {
          // Compatible
          return 'transform: translate(' + (history.ranges.x(date) + history.margin.left) + 'px, ' + (history.ranges.y(d.data.indiceUV) + history.margin.top - 30) + 'px);\n                      -ms-transform: translate(' + (history.ranges.x(date) + history.margin.left) + 'px, ' + (history.ranges.y(d.data.indiceUV) + history.margin.top - 30) + 'px);\n                      -webkit-transform: translate(' + (history.ranges.x(date) + history.margin.left) + 'px, ' + (history.ranges.y(d.data.indiceUV) + history.margin.top - 30) + 'px);';
        });

        rect.style('fill', function () {
          if (d.data.indiceUV == 0) {
            return stateRadiation(2, 'color');
          } else {
            return stateRadiation(d.data.indiceUV, 'color');
          }
        });

        text.text(formatDate(date.getHours()) + ':' + formatDate(date.getMinutes()) + ' | UV ' + d.data.indiceUV);
      }).on('mouseout', function (d) {
        tooltip.attr('class', 'hide');
      });
    };
    updateHistory = function updateHistory(data) {
      $('#lineChart').empty();
      createHistory(data);
    };

    getRadiation(crearSeccionRadiacionUv, updateRecomendation, createHistory, true);

    $('#caba').on('click', function () {
      if (ubicacion !== 'caba') {
        ubicationUpdate('caba');

        $('#ubicaciones').attr('class', function () {
          if (radiation.now == 0) {
            return 'ubicacionNoche';
          } else {
            return 'ubicacionDia';
          }
        });

        $('#ushuaia').attr('class', 'botonUbicacion');
        $('#resistencia').attr('class', 'botonUbicacion');
        $('#caba').attr('class', 'botonUbicacion botonActivo');

        getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateHistory, true);
      }
    });
    $('#ushuaia').on('click', function () {
      if (ubicacion !== 'ushuaia') {
        ubicationUpdate('ushuaia');

        $('#ubicaciones').attr('class', function () {
          if (radiation.now == 0) {
            return 'ubicacionNoche';
          } else {
            return 'ubicacionDia';
          }
        });

        $('#caba').attr('class', 'botonUbicacion');
        $('#resistencia').attr('class', 'botonUbicacion');
        $('#ushuaia').attr('class', 'botonUbicacion botonActivo');

        getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateHistory, true);
      }
    });
    $('#resistencia').on('click', function () {
      if (ubicacion !== 'ushuaia') {
        ubicationUpdate('resistencia');

        $('#ubicaciones').attr('class', function () {
          if (radiation.now == 0) {
            return 'ubicacionNoche';
          } else {
            return 'ubicacionDia';
          }
        });

        $('#caba').attr('class', 'botonUbicacion');
        $('#ushuaia').attr('class', 'botonUbicacion');
        $('#resistencia').attr('class', 'botonUbicacion botonActivo');

        getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateHistory, true);
      }
    });

    $('#left').on('click', function () {
      d3.select('#slides').transition().attr('style', function () {
        // Compatible
        position = position + 20;

        if (position === 40) {
          $('#left').hide();
        } else if (position === -40) {
          $('#right').hide();
        } else {
          $('#left').show();
          $('#right').show();
        }

        return 'transform: translateX(' + position + '%);\n                  -ms-transform: translateX(' + position + '%);\n                  -webkit-transform: translateX(' + position + '%);';
      });
    });
    $('#right').on('click', function () {
      d3.select('#slides').transition().attr('style', function () {
        // Compatible
        position = position - 20;

        if (position === 40) {
          $('#left').hide();
        } else if (position === -40) {
          $('#right').hide();
        } else {
          $('#left').show();
          $('#right').show();
        }

        return 'transform: translateX(' + position + '%);\n                  -ms-transform: translateX(' + position + '%);\n                  -webkit-transform: translateX(' + position + '%);';
      });
    });

    setInterval(function () {
      getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateHistory);
    }, 1000 * 60 * 10);
  };
  var adjustResponsive = function adjustResponsive() {
    var section1 = $('#sectionDer');
    var section2 = $('#section2');

    if (!getResponsive(600)) {
      section1.append(section2.children().children());

      $('#left').hide();
      $('#right').hide();

      d3.select('#slides').attr('style', function () {
        // Compatible

        return 'transform: translateX(0%);\n                -ms-transform: translateX(0%);\n                -webkit-transform: translateX(0%);';
      });
    } else {
      section2.children().append(section1.children());

      $('#left').show();
      $('#right').show();

      if (position === 40) {
        $('#left').hide();
      } else if (position === -40) {
        $('#right').hide();
      } else {
        $('#left').show();
        $('#right').show();
      }

      d3.select('#slides').attr('style', function () {
        // Compatible

        return 'transform: translateX(40%);\n                -ms-transform: translateX(40%);\n                -webkit-transform: translateX(40%);';
      });
    }
  };

  ejecutarReloj();
  ejecutarClima();
  ejecutarRadiacion();
  adjustResponsive();

  $(window).resize(function () {
    adjustResponsive();
    updateHistory(arrData);
  });
});