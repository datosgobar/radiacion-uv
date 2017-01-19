'use strict';

// Dynamic Variables
var realRadiation = void 0; // Esta variable se acutaliza constantemente en base al valor real de la radiación UV
var secondsCount = void 0; // Esta variable se actualiza constantemente en base a la cantidad de segundos transcurridos de la última actualización
var pronostic = void 0; // Esta variable se actualiza constantemente en base a la información que recibe del SMA
var tempIcon = void 0; // Esta variable se actualiza constantemente en base al valor real de la temperatura
var temp = void 0; // Esta variable se actualiza constantemente en base al valor real de la temperatura

// Static Variables
var tempIcons = {
  'clear': 'soleado',
  'partlycloudy': 'parcialmente-nublado',
  'chancerain': 'lluvia',
  'tstorms': 'tormenta',
  'nt_clear': 'noche',
  'cloudy': 'nublado',
  'chancetstorms': 'inestable'
};

// Functions Repository
var sizeObject = function sizeObject(obj) {
  // Size Object
  var size = 0;
  var key = void 0;

  for (key in obj) {

    if (obj.hasOwnProperty(key)) {
      size++;
    }
  }

  return size;
};
var formatDate = function formatDate(date) {
  // Return date with two digits
  return date > 9 ? date : '0' + date;
};
var average = function average(array) {
  // Return average to array number
  var total = 0;

  array.forEach(function (v, k) {
    total = total + v;
  });

  total = total / array.length;

  return total;
};
var stateRadiation = function stateRadiation(object, radiationLvl, data) {
  // Return State Data

  for (var state in object.states) {

    if (radiationLvl >= object.states[state].minValue) {
      return object.states[state][data];
    }
  }
};
var measureConstruct = function measureConstruct(radiation, inicial) {
  // Measure Contruct Function
  var scaleRadiation = d3.scaleLinear().domain([radiation.min, radiation.max]).range([5, 11]); // Scale
  var radiationVal = inicial === 'inicial' ? 11 : scaleRadiation(radiation.now);
  var medidorUv = d3.arc().outerRadius(radiation.diameter / 2).innerRadius(radiation.diameter / 2 - radiation.anchor).startAngle(Math.PI / 4 * 5).endAngle(Math.PI / 4 * radiationVal).cornerRadius(radiation.anchor);

  return medidorUv;
};
var getResponsive = function getResponsive(max) {
  var responsive = $(window).outerWidth() < max ? true : false;

  return responsive;
};
var calculatePronosticdate = function calculatePronosticdate(hours) {
  // Devuelve el horario para el pronostico
  var dat = new Date();
  dat.setHours(dat.getHours() + hours);
  var date = formatDate(dat.getDate()) + '-' + formatDate(dat.getMonth() + 1) + '-' + dat.getFullYear();
  var hour = formatDate(dat.getHours()) + ':' + formatDate(dat.getMinutes()).toString().slice(0, 1) + '0';
  // console.log({ 'fecha': date, 'hora': hour }); // Entorno de desarrollo
  return [date, hour];
};
var clock = function clock(element) {
  // Reloj
  var date = new Date();
  var hours = formatDate(date.getHours());
  var minutes = formatDate(date.getMinutes());
  var seconds = formatDate(date.getSeconds());

  // Count ++
  secondsCount++;

  // Insert Time
  if (secondsCount % 2 === 0) {
    $('#' + element).empty().append(hours + '<span>:</span>' + minutes);
  } else {
    $('#' + element).empty().append(hours + '<span style="color:transparent">:</span>' + minutes);
  }
};
var refreshLastUpdate = function refreshLastUpdate(id, seconds) {
  // Refresca el tiempo de la última actualización
  var minutes = Math.floor(seconds / 60);

  if (minutes === 0) {
    d3.select('#' + id).text('ACTUALIZADO');
  } else if (minutes === 1) {
    d3.select('#' + id).text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTO');
  } else {
    d3.select('#' + id).text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTOS');
  }
};

// Solicitud de datos
var getRadiation = function getRadiation(callback, callback2) {
  // SMA API
  var dat = new Date();
  var date = dat.getDate() + '-' + formatDate(dat.getMonth() + 1) + '-' + dat.getFullYear();
  var hour = formatDate(dat.getHours()) + ':' + formatDate(dat.getMinutes()).toString().slice(0, 1) + '0:00';
  // console.log(date);                   // Entorno de desarrollo
  // console.log(hour);                   // Entorno de desarrollo

  $.get('public/source/realTime.json', function (data) {
    var arrData = data.datosRecientes[0].indiceUV;

    // console.log(arrData);              // Entorno de desarrollo
    arrData.forEach(function (v, k) {
      if (v.fecha === date && v.hora === hour) {
        realRadiation = Math.floor(v.indiceUV);
      }
    });
    console.log(realRadiation); // Entorno de desarrollo
    // window.radiation = realRadiation;  // Entorno de desarrollo
    callback();
    callback2(arrData);
  }).fail(function () {
    console.error('Fallo la conexion con la API del SMA'); // Entorno de desarrollo
    setTimeout(getRadiation(callback), 1000 * 60 * 5); // Se vuelve a hacer el pedido luego de 5 minutos.
  });
};
var getWeather = function getWeather(callback) {
  // WunderGround API
  var config = {
    apiKey: 'c066b44dfe686a69',
    location: 'mar_del_plata',
    typeFile: 'json'
  };
  var url = 'http://api.wunderground.com/api/' + config.apiKey + '/conditions/SP/q/' + config.location + '.' + config.typeFile;

  $.get(url, function (data) {
    // console.log(data); // Entorno de desarrollo
    temp = parseFloat(data.current_observation.feelslike_c) + ' \xBAC';
    tempIcon = data.current_observation.icon;
    console.log(temp); // Entorno de desarrollo
    console.log(tempIcon); // Entorno de desarrollo
    callback();
  }).fail(function () {
    console.error('Fallo la conexion con la API de WG'); // Entorno de desarrollo
    setTimeout(getWeather(callback), 1000 * 60 * 5); // Se vuelve a hacer el pedido luego de 5 minutos.
  });
};

$(document).ready(function () {

  var radiation = { // Global Object Radiation
    max: 15,
    min: 0,
    now: 1,
    diameter: $('#sectionIzq').outerWidth(),
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
        color: 'rgba(241, 133, 75, 1)',
        recomendation: 'Necesitas protección solar extra',
        position: 2,
        minValue: 6,
        lvl: 4
      },
      moderate: {
        name: 'Moderado',
        color: 'rgba(233, 184, 66, 1)',
        recomendation: 'Buscá sombra y usa protección solar',
        position: 1,
        minValue: 3,
        lvl: 3
      },
      low: {
        name: 'Bajo',
        color: 'rgba(66, 190, 92, 1)',
        recomendation: 'Podés estar al aire libre con mínima protección',
        position: 0,
        minValue: 0,
        lvl: 2
      }
    }
  };
  var fullpage = { // Full Page object config
    //Navigation
    menu: '#menu',
    lockAnchors: false,
    anchors: [],
    navigation: false,
    navigationPosition: 'right',
    navigationTooltips: [],
    showActiveTooltip: false,
    slidesNavigation: getResponsive(600),
    slidesNavPosition: 'bottom',

    //Scrolling
    css3: false,
    scrollingSpeed: 700,
    autoScrolling: false,
    fitToSection: false,
    fitToSectionDelay: 1000,
    scrollBar: true,
    easing: 'easeInOutCubic',
    easingcss3: 'ease',
    loopBottom: false,
    loopTop: false,
    loopHorizontal: false,
    continuousVertical: false,
    continuousHorizontal: false,
    scrollHorizontally: true,
    interlockedSlides: false,
    dragAndMove: false,
    offsetSections: false,
    resetSliders: false,
    fadingEffect: false,
    normalScrollElements: '#element1, .element2',
    scrollOverflow: false,
    scrollOverflowOptions: null,
    touchSensitivity: 15,
    normalScrollElementTouchThreshold: 5,
    bigSectionsDestination: null,

    //Accessibility
    keyboardScrolling: false,
    animateAnchor: true,
    recordHistory: true,

    //Design
    controlArrows: true,
    verticalCentered: true,
    sectionsColor: [],
    paddingTop: '0px',
    paddingBottom: '0px',
    fixedElements: '#header, .footer',
    responsiveWidth: 10000,
    responsiveHeight: 0,
    responsiveSlides: false,

    //Custom selectors
    sectionSelector: '.sectionFullPage',
    slideSelector: getResponsive(600) ? '.slide' : '',
    lazyLoading: true,

    //events
    onLeave: function onLeave(index, nextIndex, direction) {},
    afterLoad: function afterLoad(anchorLink, index) {},
    afterRender: function afterRender() {},
    afterResize: function afterResize() {},
    afterResponsive: function afterResponsive(isResponsive) {},
    afterSlideLoad: function afterSlideLoad(anchorLink, index, slideAnchor, slideIndex) {},
    onSlideLeave: function onSlideLeave(anchorLink, index, slideIndex, direction, nextSlideIndex) {}
  };

  $('#fullpage').fullpage(fullpage); // Full Page Start

  var updateRadiation = function updateRadiation() {
    // Actualiza los componentes que dependen del estado de la radiación UV
    // Reset Timer Update
    secondsCount = 0;

    radiation.now = realRadiation;
    // console.log(radiation.now); // Entorno de desarrollo

    $('#dinamic').attr('d', measureConstruct(radiation)); // Dinamic Measure
    $('#lvlRadiation').text(radiation.now); // Value Radiation UV
    $('#state').empty().text(stateRadiation(radiation, radiation.now, 'name')); // State Radiation UV
    $('#sectionIzq').css({ 'backgroundColor': stateRadiation(radiation, radiation.now, 'color') }); // UV Background Color
    $('#recomendation').empty().text(stateRadiation(radiation, radiation.now, 'recomendation')); // String Recomendation Radiation UV

    var protectionContainer = $('.protection-icon');
    var protectionLvl = stateRadiation(radiation, radiation.now, 'lvl');

    protectionContainer.each(function (k, v) {
      var element = protectionContainer.eq(k).attr('id').split('_')[1];

      if (element <= protectionLvl) {
        protectionContainer.eq(k).children('.svgStroke').css({ 'stroke': stateRadiation(radiation, radiation.now, 'color') });
        protectionContainer.eq(k).children('.svgFill').css({ 'fill': stateRadiation(radiation, radiation.now, 'color') });
        protectionContainer.eq(k).parent().children('span').css({ 'color': 'black' });
      } else {
        protectionContainer.eq(k).children('.svgStroke').css({ 'stroke': 'silver' });
        protectionContainer.eq(k).children('.svgFill').css({ 'fill': 'silver' });
        protectionContainer.eq(k).parent().children('span').css({ 'color': 'silver' });
      }
    });
  };
  var updateWeather = function updateWeather() {
    // Actualiza los componentes que dependen del estado de la temperatura
    // Reset Timer Update
    secondsCount = 0;

    if (temp !== 'null' && tempIcon !== 'null') {
      d3.select('#temp-weather').text(temp);
      d3.select('#icon-weather').attr('class', function () {
        return tempIcons[tempIcon];
      });
    }
  };
  var updateForecast = function updateForecast(data) {
    // Actualiza los componentes que dependen del pronostico
    // Reset Timer Update
    secondsCount = 0;

    var dat = new Date();
    pronostic = [];

    for (var i = 1; i < 4; i++) {
      pronostic.push(calculatePronosticdate(i));
    }

    data.forEach(function (v, k) {

      for (var i = 0; i < pronostic.length; i++) {

        if (v.fecha === pronostic[i][0] && v.hora === pronostic[i][1] + ':00') {
          pronostic[i].push(v.indiceUV);
        }
      }
    });
    // console.log(pronostic); // Entorno de desarrollo
    $('#forecast').empty();

    pronostic.forEach(function (v, k) {

      if (v[2]) {
        console.log(v); // Entorno de desarrollo
        $('#forecast').append('<article>\n          <span class="pronostico_horario">' + v[1] + '</span>\n          <svg class="pronostico_barra" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 235 15">\n            <line fill="none" stroke="silver" stroke-linecap="round" stroke-linejoin="round" stroke-width="15px" x1="7.5" y1="7.5" x2="227.5" y2="7.5"/>\n            <line fill="none" stroke="' + stateRadiation(radiation, v[2], 'color') + '" stroke-linecap="round" stroke-linejoin="round" stroke-width="15px" x1="7.5" y1="7.5" x2="' + 227.5 / sizeObject(radiation.states) * (stateRadiation(radiation, v[2], 'position') + 1) + '" y2="7.5"/>\n            <circle fill="white" stroke="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="15px" cx="' + 227.5 / sizeObject(radiation.states) * (stateRadiation(radiation, v[2], 'position') + 1) + '" cy="7.44" r="5.15"/>\n          </svg>\n          <span class="pronostico_estado">' + stateRadiation(radiation, v[2], 'name') + '</span>\n        </article>');
      }
    });
  };
  var createMeasure = function createMeasure() {
    // Crea el medidor UV

    var measure = measureConstruct(radiation, 'inicial');
    var measureUv = measureConstruct(radiation);

    var svgContainer = d3.select('#medidor').append('svg').attr('width', '100%').attr('height', function () {
      return radiation.diameter - radiation.diameter / 2 * 0.29289;
    }).attr('viewBox', function () {
      var height = radiation.diameter - radiation.diameter / 2 * 0.29289;
      var diameter = radiation.diameter;
      var viewBox = '0 0 ' + diameter + ' ' + height;

      return viewBox;
    });
    svgContainer.append('path') // Medidor Estatico
    .style('fill', 'black').style('opacity', 0.1).style('transform', function () {
      return 'translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px)';
    }).attr('d', measure());
    svgContainer.append('path') // Medidor Dinamico
    .attr('id', 'dinamic').style('fill', 'white').style('transform', function () {
      return 'translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 2 + 'px)';
    }).attr('d', measureUv());
    svgContainer.append('text') // Texto UV
    .attr('text-anchor', 'middle').attr('alignment-baseline', 'middle').style('fill', 'black').style('opacity', 0.1).style('font-size', '14rem').style('transform', function () {
      return 'translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 3.5 + 'px';
    }).text('UV');
    svgContainer.append('text') // min
    .attr('text-anchor', 'middle').attr('alignment-baseline', 'end').style('fill', 'white').style('font-size', '1.5rem').style('transform', function () {
      return 'translate(' + radiation.diameter / 8 * 0.5 + 'px, ' + radiation.diameter / 8 * 7 + 'px';
    }).text('0');
    svgContainer.append('text') // max
    .attr('text-anchor', 'middle').attr('alignment-baseline', 'end').style('fill', 'white').style('font-size', '1.5rem').style('transform', function () {
      return 'translate(' + radiation.diameter / 8 * 7.5 + 'px, ' + radiation.diameter / 8 * 7 + 'px';
    }).text('11+');
    svgContainer.append('text') // Estado de Radiacion UV
    .attr('id', 'state').attr('text-anchor', 'middle').attr('alignment-baseline', 'end').style('fill', 'white').style('font-size', '3rem').style('font-weight', '200').style('transform', function () {
      return 'translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 5.4 + 'px';
    });
    svgContainer.append('text') // Nivel de Radiacion UV
    .attr('id', 'lvlRadiation').attr('text-anchor', 'middle').attr('alignment-baseline', 'end').style('fill', 'white').style('font-size', '3rem').style('font-weight', '800').style('transform', function () {
      return 'translate(' + radiation.diameter / 2 + 'px, ' + radiation.diameter / 8 * 6.3 + 'px';
    });
  };

  // Solicitud de datos
  getRadiation(updateRadiation, updateForecast);
  getWeather(updateWeather);
  createMeasure();

  // Resize Control
  var adjustResponsive = function adjustResponsive() {
    var contenedor = $('#fullpage');
    var section1 = $('#sectionDer');
    var section2 = $('#section2').children().children();

    $.fn.fullpage.destroy('all');

    if (!getResponsive(600)) {
      section1.append(section2);
    } else {
      $('#section2').children().append(section1.children());
    }

    $('#fullpage').fullpage(fullpage);
  };

  adjustResponsive();

  $(window).resize(function () {
    var sizeWindow = $(window).outerWidth();

    fullpage.slidesNavigation = getResponsive(600);
    fullpage.slideSelector = getResponsive(600) ? '.slide' : '';

    adjustResponsive();

    //radiation.diameter = (($('#section1 > div > section').outerWidth() * 0.9) > 350) ? (350) : ($('#section1 > div > section').outerWidth() * 0.9);
  });

  // Create Line chart
  var createLineChart = function createLineChart(data) {
    // Gráfico de Linea

    var margin = { top: 10, right: 30, bottom: 40, left: 40 };
    var width = $('#lineChart').outerWidth() - margin.left - margin.right;
    var height = $('#lineChart').outerHeight() - margin.top - margin.bottom;
    var lineChart = d3.select('#lineChart');
    var dataset = [];

    // Data Processor
    for (var day in data) {

      for (var hour in data[day]) {
        dataset.push([day + ' ' + hour, data[day][hour]]);
      }
    }

    // Set the ranges
    var x = d3.scaleTime().domain([new Date(2017, 0, 9), new Date(2017, 0, 16)]).range([0, width]);
    var y = d3.scaleLinear().domain([0, 11]).range([height, 0]);

    // Funciones
    var graphAxis = function graphAxis(svgElemento, axis, axisName, axisValue) {

      if ($('#' + axisValue)) {
        $('#' + axisValue).remove();
      }

      if (axisValue === 'x') {
        svgElemento.append('svg:g').attr('id', axisName).attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(axis);
      } else {
        svgElemento.append('svg:g').attr('id', axisName).attr('class', 'y axis').attr('transform', 'translate(-25,0)').call(axis);
      }
    };
    var axisFactory = function axisFactory(nameAxis) {
      var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


      var axisCreate = void 0;

      var textDay = d3.timeFormat('%a');
      var numberDay = d3.timeFormat('%d');
      var month = d3.timeFormat('%b');

      switch (nameAxis) {
        case '12hours':
          axisCreate = d3.axisBottom(x).ticks(d3.timeHour.every(12)).tickFormat(d3.timeFormat('%H:%M')).tickSizeInner(-height).tickSizeOuter(0).tickPadding(padding);
          break;
        case '24hours':
          axisCreate = d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat('%H:%M')).tickSizeInner(-height).tickSizeOuter(0).tickPadding(padding);
          break;
        case 'fullDate':
          axisCreate = d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(function (d) {
            return textDay(d) + '. ' + numberDay(d) + ' ' + month(d);
          }).tickSizeInner(0).tickSizeOuter(0).tickPadding(padding);
          break;
        case 'partDay':
          axisCreate = d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(function (d) {
            return '' + numberDay(d);
          }).tickSizeInner(0).tickSizeOuter(0).tickPadding(padding);
          break;
        case 'month':
          axisCreate = d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(function (d) {
            return '' + month(d);
          }).tickSizeInner(0).tickSizeOuter(0).tickPadding(padding);
          break;
        case 'axisY':
          axisCreate = d3.axisLeft(y).tickPadding(0).tickSizeInner(0).tickSizeOuter(0).tickValues([0, 3, 6, 8, 11]);
          break;
      }

      return axisCreate;
    };

    var xAxisLine1 = void 0;
    var xAxisLine2 = void 0;
    var yAxis = axisFactory('axisY');

    if ($(window).outerWidth() > 600) {
      xAxisLine1 = axisFactory('12hours', 10);
      xAxisLine2 = axisFactory('fullDate', 30);
    } else {
      xAxisLine1 = axisFactory('month', 10);
      xAxisLine2 = axisFactory('partDay', 30);
    }

    // Define the line
    var line = d3.line().curve(d3.curveBasis).x(function (d, i) {
      return x(new Date(d[0]));
    }).y(function (d, i) {
      return y(d[1]);
    });

    var svg = lineChart.append('svg:svg').attr('preserveAspectRatio', 'xMidYMid meet').attr('width', '100%').attr('height', '100%');
    var defs = svg.append('svg:defs');

    var pattern = defs.append('svg:pattern').attr('id', 'image').attr('x', 0).attr('y', 0).attr('patternUnits', 'userSpaceOnUse').attr('height', '100%').attr('width', '100%');
    pattern.append('svg:image').attr('x', 0).attr('y', 0).attr('xlink:href', 'public/img/gradient.svg').attr('width', function () {
      return $('#lineChart').outerWidth() - margin.right - margin.left;
    }).attr('height', function () {
      return $('#lineChart').outerHeight() - margin.bottom - margin.top;
    });

    var graph = svg.append('svg:g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    graphAxis(graph, xAxisLine1, 'xAxisLine1', 'x');
    graphAxis(graph, xAxisLine2, 'xAxisLine2', 'x');
    graphAxis(graph, yAxis, 'yAxis', 'y');

    graph.append('path').attr('id', 'lineChartGraph').attr('d', line(dataset)).attr('stroke', 'url(#image)').attr('stroke-linejoin', 'round').attr('stroke-width', '0.5rem');

    var focus = svg.append('g').attr('class', 'focus').attr('style', 'transform: translate(-100px, -100px)');
    focus.append('circle').attr('r', 8).attr('stroke-width', '2px');
    var voronoi = d3.voronoi().x(function (d) {
      return x(new Date(d[0]));
    }).y(function (d) {
      return y(d[1]);
    }).extent([[0, 0], [width, height + margin.top]]);
    var voronoiGroup = svg.append('g').attr('class', 'voronoi').attr('style', 'transform: translate(' + margin.left + 'px, ' + margin.top + 'px)');
    // console.log(dataset); // Entorno de desarrollo


    voronoiGroup.selectAll('path').data(voronoi(dataset).polygons()).enter().append('path').attr('d', function (d) {
      // console.log(d); // Entorno de desarrollo
      if (d) {
        return 'M' + d.join('L') + 'Z';
      }
    }).on('mouseover', function (d) {
      var date = new Date(d.data[0]);

      focus.attr('style', 'transform: translate(' + (x(new Date(d.data[0])) + margin.left) + 'px, ' + (y(d.data[1]) + margin.top) + 'px)');
    }).on('mouseout', function (d) {

      focus.attr('style', 'transform: translate(-100px, -100px)');
    });
  };

  // Translate Date
  var dateFormat = void 0;

  d3.json('https://unpkg.com/d3-time-format@2.0.3/locale/es-ES.json', function (data) {

    d3.timeFormatDefaultLocale(data);

    dateFormat = d3.timeFormat('%c');

    // Get History Radiation UV Data
    $.get('public/source/history.json', function (data) {
      return createLineChart(data);
    });
  });

  // adjust margin navBar slides
  $('#section4 .fp-slidesNav').attr('style', 'transform: translate(-50%)').children().children().each(function (k, v) {
    $(v).attr('style', 'margin: 7px 0px');
  });

  // Intervalos
  setInterval(function () {
    // Se actualiza el reloj cada 1 segundo
    refreshLastUpdate('actualizacion', secondsCount);
    clock('time');
  }, 1000);
  setInterval(function () {
    // Se actualiza la radiación UV cada 10 minutos
    getRadiation(updateRadiation, updateForecast);
  }, 1000 * 60 * 10);
  setInterval(function () {
    // Se actualiza la temperatura cada 60 minutos
    getWeather(updateWeather);
  }, 1000 * 60 * 60);
});