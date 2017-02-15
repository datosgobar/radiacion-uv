'use strict';

var secondsCount = 0;
var updateHistory = void 0;
var arrData = void 0;
var position = 40;

var chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var darken = function darken(c, n, i, d) {
  for (i = 3; i--; c[i] = d < 0 ? 0 : d > 255 ? 255 : d | 0) {
    d = c[i] + n;
  }return c;
};

var spanish = {
  'dateTime': '%A, %e de %B de %Y, %X',
  'date': '%d/%m/%Y',
  'time': '%H:%M:%S',
  'periods': ['AM', 'PM'],
  'days': ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  'shortDays': ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  'months': ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  'shortMonths': ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
};

var spanishFormatDate = d3.timeFormatDefaultLocale(spanish);
var d3Format = d3.timeFormat('%c');

// Funciones Globales
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
          color: 'rgb(105, 83, 134)',
          recomendation: 'Por favor, no te expongas al sol.',
          position: 4,
          minValue: 11,
          lvl: 6
        },
        very: {
          name: 'Muy Alto',
          color: 'rgb(242, 56, 90)',
          recomendation: 'Por favor, no te expongas al sol.',
          position: 3,
          minValue: 8,
          lvl: 6
        },
        higth: {
          name: 'Alto',
          color: 'rgb(255, 129, 64)',
          recomendation: 'Usá mucha protección y buscá sombra.',
          position: 2,
          minValue: 6,
          lvl: 4
        },
        moderate: {
          name: 'Moderado',
          color: 'rgb(255, 187, 66)',
          recomendation: 'Usá bloqueador solar y buscá sombra.',
          position: 1,
          minValue: 3,
          lvl: 3
        },
        low: {
          name: 'Bajo',
          color: 'rgb(2, 213, 122)',
          recomendation: 'Disfrutá el aire libre con bloqueador solar adecuado a tu piel.',
          position: 0,
          minValue: 0.1,
          lvl: 2
        },
        hide: {
          name: 'Sin Radiación',
          color: 'rgb(39, 180, 245)',
          recomendation: 'El sol está durmiendo. ¡Hasta luego!',
          position: -1,
          minValue: 0,
          lvl: 0
        }
      }
    };
    var medidorDinamico = void 0;
    var medidorPunto = void 0;
    var medidor = void 0;
    var medPunto = void 0;
    var escala = void 0;
    var ahora = void 0;
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
      medidor = function medidor(final) {
        return d3.arc().outerRadius(radiation.diameter / 2).innerRadius(radiation.diameter / 2 - radiation.anchor).startAngle(Math.PI / 4 * 5).endAngle(Math.PI / 4 * final).cornerRadius(radiation.anchor);
      };
      medPunto = function medPunto(inicial, final) {
        return d3.arc().outerRadius(radiation.diameter / 2 - radiation.anchor / 4).innerRadius(radiation.diameter / 2 - radiation.anchor + radiation.anchor / 4).startAngle(Math.PI / 4 * inicial).endAngle(Math.PI / 4 * final).cornerRadius(radiation.anchor);
      };

      var maximo = escala(radiation.max);
      ahora = escala(radiation.now <= 11 ? radiation.now : 11);

      var medidorEstatico = medidor(maximo);
      medidorDinamico = medidor(ahora);
      medidorPunto = medPunto(ahora - 0.07 - 0.04, ahora - 0.04);

      var svg = contenedorMedidor.append('svg').attr('id', 'svgMedidor').attr('viewBox', function () {
        return '0 0 ' + radiation.diameter + ' ' + (radiation.diameter - radiation.diameter / 2 * 0.29289);
      });
      svg.append('path') // Medidor Estatico
      .attr('d', medidorEstatico()).attr('class', 'staticMeasure').attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);';
      });
      svg.append('svg:path') // Medidor Dinamico
      .attr('id', 'dynamic').attr('d', medidorDinamico()).attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);';
      });
      svg.append('svg:path') // Nuevo Medidor
      .attr('id', 'medidorPunto1').attr('d', medidorPunto()).attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);';
      }).style('fill', function () {
        return stateRadiation(radiation.now, 'color');
      });
      svg.append('svg:path') // Nuevo Medidor
      .attr('id', 'medidorPunto2').attr('d', medidorPunto()).attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px);';
      }).style('fill', 'rgba(0, 0, 0, 0.1)');

      svg.append('svg:text') // Texto UV
      .attr('class', 'measureText').attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 3.5 + 'px) translateY(3.5rem);\n                  -moz-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 3.5 + 'px) translateY(3.5rem);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 3.5 + 'px) translateY(3.5rem);';
      }).text('UV');
      svg.append('svg:text') // vMin
      .attr('class', 'measureMinMax').attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 8 * 0.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 8 * 0.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 8 * 0.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);';
      }).text('0');
      svg.append('svg:text') // vMax
      .attr('class', 'measureMinMax').attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 8 * 7.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 8 * 7.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 8 * 7.5 + 'px, ' + radiation.diameter / 8 * 6.75 + 'px);';
      }).text('11+');

      svg.append('svg:text') // Estado
      .attr('id', 'state').attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 5.4 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 5.4 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 5.4 + 'px);';
      }).text(stateRadiation(radiation.now, 'name'));
      svg.append('svg:text') // Valor
      .attr('id', 'lvlRadiation').attr('style', function () {

        return 'transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 6.3 + 'px);\n                  -moz-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 6.3 + 'px);\n                  -webkit-transform: translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 6.3 + 'px);';
      }).text(radiation.now);

      d3.select('#recomendation').text(stateRadiation(radiation.now, 'recomendation'));
      d3.select('#sectionIzq').style('background-color', stateRadiation(radiation.now, 'color'));
    };
    var updateSeccionRadiacionUv = function updateSeccionRadiacionUv() {
      // Reset Timer Update
      secondsCount = 0;

      ahora = escala(radiation.now <= 11 ? radiation.now : 11);

      medidorDinamico = medidor(ahora);
      medidorPunto = medPunto(ahora - 0.07 - 0.04, ahora - 0.04);

      d3.select('#dynamic').attr('d', medidorDinamico()); // Medidor
      d3.select('#medidorPunto1').attr('d', medidorPunto()).style('fill', function () {
        return stateRadiation(radiation.now, 'color');
      }); // Medidor
      d3.select('#medidorPunto2').attr('d', medidorPunto()); // Medidor
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

      $.get('public/source/caba.json', function (data) {
        arrData = data.datosRecientes[0].indiceUV;

        radiation.now = arrData[arrData.length - 1].indiceUV;

        if (dateObj.hour >= 21) {
          radiation.states.hide.recomedation = 'El sol está durmiendo. ¡Hasta luego!';
        } else {
          radiation.states.hide.recomedation = 'El día está feo y la radiación es muy baja.';
        }

        arrData.forEach(function (v, k) {
          v = standarDate(v);
        });

        console.log('Se hace pedido GET');
        radiacion();
        recomendation();
        history(arrData);
      });
    };
    var convertElement = function convertElement(element) {
      // console.log(element);
      var fecha = element.fecha.split('-');
      var date = formatDate(fecha[2]) + '/' + formatDate(fecha[1]) + '/' + formatDate(fecha[0]) + ' ' + element.hora;

      return date;
    };
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

            return 'transform: translate(0px, ' + history.height + 'px);\n                      -moz-transform: translate(0px, ' + history.height + 'px);\n                      -webkit-transform: translate(0px, ' + history.height + 'px);';
          }).call(axis);
          if (index === true) {
            element.append('svg:text').attr('class', 'xIndex').attr('style', function () {

              return 'transform: translate(' + history.width + 'px, 35px);\n                        -moz-transform: translate(' + history.width + 'px, 35px);\n                        -webkit-transform: translate(' + history.width + 'px, 35px);';
            }).text('TIEMPO');
          }
        } else {
          var _element = svgElemento.append('svg:g').attr('id', axisName).attr('class', 'y axis').attr('style', function () {

            return 'transform: translate(-20px, 0px);\n                      -moz-transform: translate(-20px, 0px);\n                      -webkit-transform: translate(-20px, 0px);';
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
      history.defs.append('svg:pattern').attr('id', 'image').attr('x', 0).attr('y', 0).attr('patternUnits', 'userSpaceOnUse').attr('height', '100%').attr('width', '100%').append('svg:image').attr('id', 'mascara').attr('y', 0).attr('x', 0).attr('xlink:href', 'public/image/gradient.svg').attr('width', function () {
        return history.width;
      }).attr('height', function () {
        return history.height;
      });
      history.graph = history.svg.append('svg:g').attr('style', function () {
        return 'transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -moz-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -webkit-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);';
      });

      history.graphAxis(history.graph, history.axis.xAxisLine1, 'xAxisLine1', 'x', true);
      history.graphAxis(history.graph, history.axis.xAxisLine2, 'xAxisLine2', 'x', false);
      history.graphAxis(history.graph, history.axis.yAxis, 'yAxis', 'y', true);

      history.graph.append('path').attr('id', 'lineChartGraph').attr('d', history.line(dataset)).attr('stroke', function () {
        if (chrome) {
          return 'url(#image)';
        } else {
          return 'rgba(255, 255, 255, 0.5)';
        }
      }).attr('stroke-linejoin', 'round').attr('stroke-width', '0.5rem');

      var tooltip = history.svg.append('g').attr('id', 'tooltip').attr('class', 'hide');
      var rect = tooltip.append('rect').attr('class', 'toolRect').attr('rx', '10px').attr('ry', '10px');
      var text = tooltip.append('text').attr('class', 'toolText');
      var focus = tooltip.append('circle').attr('class', 'toolCircle').attr('r', '8px');

      history.voronoi = d3.voronoi().x(function (d) {
        return history.ranges.x(new Date(convertElement(d)));
      }).y(function (d) {
        return history.ranges.y(d.indiceUV);
      }).extent([[0, 0], [history.width, history.height]]);
      history.voronoiGroup = history.svg.append('g').attr('class', 'voronoi').attr('style', function () {
        return 'transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -moz-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);\n                  -webkit-transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px);';
      });

      history.voronoiGroup.selectAll('path').data(history.voronoi(dataset).polygons()).enter().append('path').attr('d', function (d) {
        if (d) {
          return 'M' + d.join('L') + 'Z';
        }
      }).on('mouseover', function (d) {
        var date = new Date(convertElement(d.data));

        tooltip.attr('class', '').attr('style', function () {
          return 'transform: translate(' + (history.ranges.x(date) + history.margin.left) + 'px, ' + (history.ranges.y(d.data.indiceUV) + history.margin.top - 30) + 'px);\n                      -moz-transform: translate(' + (history.ranges.x(date) + history.margin.left) + 'px, ' + (history.ranges.y(d.data.indiceUV) + history.margin.top - 30) + 'px);\n                      -webkit-transform: translate(' + (history.ranges.x(date) + history.margin.left) + 'px, ' + (history.ranges.y(d.data.indiceUV) + history.margin.top - 30) + 'px);';
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

    $('#flecha_izq').on('click', function () {
      d3.select('#slides').transition().attr('style', function () {
        position = position + 20;

        if (position === 40) {
          d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
          $('#flecha_izq').hide();
        } else if (position === -40) {
          d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
          $('#flecha_der').hide();
        } else {
          d3.select('.buttonSlideCenter').attr('class', 'buttonSlideSpace');
          $('#flecha_izq').show();
          $('#flecha_der').show();
        }

        return 'transform: translateX(' + position + '%);\n                  -moz-transform: translateX(' + position + '%);\n                  -webkit-transform: translateX(' + position + '%);';
      });
    });
    $('#flecha_der').on('click', function () {
      d3.select('#slides').transition().attr('style', function () {
        position = position - 20;

        if (position === 40) {
          d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
          $('#flecha_izq').hide();
        } else if (position === -40) {
          d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
          $('#flecha_der').hide();
        } else {
          d3.select('.buttonSlideCenter').attr('class', 'buttonSlideSpace');
          $('#flecha_izq').show();
          $('#flecha_der').show();
        }

        return 'transform: translateX(' + position + '%);\n                  -moz-transform: translateX(' + position + '%);\n                  -webkit-transform: translateX(' + position + '%);';
      });
    });

    setInterval(function () {
      getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateHistory);
    }, 1000 * 60 * 1);
  };
  var adjustResponsive = function adjustResponsive() {
    var section1 = $('#sectionDer');
    var section2 = $('#section2');

    if (!getResponsive(725)) {
      section1.append(section2.children().children());
    } else {
      section2.children().append(section1.children());
    }

    if (!getResponsive(600)) {
      $('#flecha_izq').hide();
      $('#flecha_der').hide();

      $('.iconos-derecha').show();
      $('.iconos-izquierda').show();

      d3.select('#slides').attr('style', function () {

        return 'transform: translateX(0%);\n                  -moz-transform: translateX(0%);\n                  -webkit-transform: translateX(0%);';
      });
    } else {
      $('#flecha_izq').show();
      $('#flecha_der').show();

      $('.iconos-derecha').hide();
      $('.iconos-izquierda').hide();

      if (position === 40) {
        $('#flecha_izq').hide();
      } else if (position === -40) {
        $('#flecha_der').hide();
      } else {
        $('#flecha_izq').show();
        $('#flecha_der').show();
      }

      d3.select('#slides').attr('style', function () {

        return 'transform: translateX(40%);\n                  -moz-transform: translateX(40%);\n                  -webkit-transform: translateX(40%);';
      });
    }
  };

  ejecutarReloj();
  ejecutarRadiacion();
  adjustResponsive();

  $(window).resize(function () {
    adjustResponsive();
    updateHistory(arrData);
  });
});