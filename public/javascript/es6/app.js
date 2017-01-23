let secondsCount;
let ubicacion = 'caba';
let archivo   = 'public/source/caba.json';

// Funciones Globales
const ubicationUpdate = (ubication) => {
  ubicacion = ubication;
  archivo = `public/source/${ ubication }.json`;
};
const formatDate = (date) => ((date > 9) ? (date) : (`0${date}`));  // Return date with two digits
const createObjectDate = (roundMinutes = false, roundSeconds = false) => {
  let dateObj = {};
      dateObj.date     = new Date();
      dateObj.year     = dateObj.date.getFullYear();
      dateObj.month    = formatDate(dateObj.date.getMonth() + 1);
      dateObj.day      = formatDate(dateObj.date.getDate());
      dateObj.hour    = formatDate(dateObj.date.getHours());
      dateObj.minute  = (roundMinutes === false) ? (formatDate(dateObj.date.getMinutes())) : (formatDate(dateObj.date.getMinutes()).toString().slice(0,1) + '0');
      dateObj.second  = (roundSeconds === false) ? (formatDate(dateObj.date.getSeconds())) : ('00');

  return dateObj;
};
const sizeObject = (obj) => {
  let size = 0;
  let key;

  for (key in obj) { if (obj.hasOwnProperty(key)) { size++; } }

  return size;
};
const getResponsive = (max) => {
  let responsive = ($(window).outerWidth() < max) ? (true) : (false);

  return responsive;
};

$(document).ready(() => {
  let dataG;

  const ejecutarClima = () => {
    let icons = {     // Set Icons
      'clear'         : 'soleado',
      'partlycloudy'  : 'parcialmente-nublado',
      'chancerain'    : 'lluvia',
      'tstorms'       : 'tormenta',
      'nt_clear'      : 'noche',
      'cloudy'        : 'nublado',
      'chancetstorms' : 'inestable'
    };

    const getWeather = (updateTemp) => {  // WunderGround API
      let config = {
        apiKey: 'c066b44dfe686a69',
        location: 'mar_del_plata',
        typeFile: 'json'
      };
      let url = `http://api.wunderground.com/api/${ config.apiKey }/conditions/SP/q/${ config.location }.${ config.typeFile }`;

      $.get(url, (data) => {
        let icon  = data.current_observation.icon;
        let temp  = `${ parseFloat(data.current_observation.feelslike_c) } ºC`;
        console.log('API WunderGround');  // Entorno de desarrollo
        console.log(temp);                // Entorno de desarrollo
        console.log(icon);                // Entorno de desarrollo
        updateTemp(icon, temp);
      }).fail(() => {
        console.error('Fallo la conexion con la API de WG');  // Entorno de desarrollo
        setTimeout(getWeather(updateTemp), (1000 * 60 * 5));
      });
    };
    const updateWeather = (icon, temp) => {
      // Reset Timer Update
      secondsCount = 0;

      d3.select('#temp-weather').text(temp);
      d3.select('#icon-weather').attr('class', () => icons[icon]);
    };

    getWeather(updateWeather);

    setInterval(() => { getWeather(updateWeather); }, (1000 * 60 * 60));  // Update 60 minutes
  };
  const ejecutarReloj = () => {
    const clock = (element) => {
      let dateObj = createObjectDate(false, false);

      // Count ++
      secondsCount++;

      // Insert Time
      if ((secondsCount % 2) === 0) {
        $('#' + element).empty().append(dateObj.hour + '<span>:</span>' +  dateObj.minute);
      } else {
        $('#' + element).empty().append(dateObj.hour + '<span style="color:transparent">:</span>' +  dateObj.minute);
      }
    };
    const refreshLastUpdate = (id, seconds) => {
      let minutes = Math.floor(seconds / 60);

      if (minutes === 0) {
        d3.select('#' + id).text('ACTUALIZADO');
      } else if (minutes === 1) {
        d3.select('#' + id).text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTO');
      } else {
        d3.select('#' + id).text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTOS');
      }
    };

    setInterval(() => {
      refreshLastUpdate('actualizacion', secondsCount);
      clock('time');
    }, 1000);
  };
  const ejecutarRadiacion = () => {

    let radiation = {
      max       : 11,
      min       : 0,
      now       : 0,
      diameter  : $('#sectionIzq').outerWidth(),
      anchor    : 15,
      states    : {
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
          color: 'rgba(245, 245, 245, 1)',
          recomendation: 'En este momento no hay niveles de radiación detectados',
          position: 0,
          minValue: 0,
          lvl: 0
        }
      }
    };
    let medidorDinamico;
    let medidor;
    let escala;
    let history = {
      'margin'  : { top: 50, right: 50, bottom: 40, left: 50 },
      'ranges'  : {},
      'axis'    : {},
    };

    const stateRadiation = (radValue, attr) => {

      for (var state in radiation.states) {
        if (radValue >= radiation.states[state].minValue) {
          return radiation.states[state][attr];
        }
      }
    };
    const crearSeccionRadiacionUv = () => {
      let contenedorMedidor = d3.select('#medidor');

      escala = d3.scaleLinear()
        .domain([radiation.min, radiation.max])
        .range([5, radiation.max]);
      medidor = (valor) => d3.arc()
          .outerRadius((radiation.diameter / 2))
          .innerRadius((radiation.diameter / 2) - radiation.anchor)
          .startAngle((Math.PI / 4) * 5)
          .endAngle((Math.PI / 4) * valor)
          .cornerRadius(radiation.anchor);

      let medidorEstatico = medidor(escala(radiation.max));
      medidorDinamico = medidor(escala((radiation.now <= 11)?(radiation.now):(11)));
      // console.log(radiation.now);
      let svg = contenedorMedidor.append('svg')
        .attr('viewBox', () => `0 0 ${ (radiation.diameter) } ${ (radiation.diameter - ((radiation.diameter / 2) * 0.29289)) }`)
        .style('width', '100%')
        .style('height', '100%');
      svg.append('path')        // Medidor Estatico
        .attr('d', medidorEstatico())
        .attr('class', 'staticMeasure')
        .style('transform', () => (`translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px)`));
      svg.append('svg:path')    // Medidor Dinamico
        .attr('id', 'dynamic')
        .attr('d', medidorDinamico())
        .style('transform', () => (`translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px)`));
      svg.append('svg:text')    // Texto UV
        .attr('class', 'measureText')
        .style('transform', () => (`translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 3.5 }px)`))
        .text('UV');
      svg.append('svg:text')    // vMin
        .attr('class', 'measureMinMax')
        .style('transform', () => (`translate(${ (radiation.diameter / 8) * 0.5 }px, ${ (radiation.diameter / 8) * 6.75 }px)`))
        .text('0');
      svg.append('svg:text')    // vMax
        .attr('class', 'measureMinMax')
        .style('transform', () => (`translate(${ (radiation.diameter / 8) * 7.5 }px, ${ (radiation.diameter / 8) * 6.75 }px)`))
        .text('11+');
      svg.append('svg:text')    // Estado
        .attr('id', 'state')
        .style('transform', () => (`translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 5.4 }px)`))
        .text(stateRadiation(radiation.now, 'name'));
      svg.append('svg:text')    // Valor
        .attr('id', 'lvlRadiation')
        .style('transform', () => (`translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 6.3 }px)`))
        .text(radiation.now);
      // svg.append('svg:circle')  // Punto
      //   .style('r', (radiation.anchor / 4))
      //   .style('transform', () => (`translate(${ (radiation.diameter / 2 ) }px, ${ (radiation.anchor / 2) }px)`));

      d3.select('#ubication').text('Capital Federal');
      d3.select('#recomendation').text(stateRadiation(radiation.now, 'recomendation'));
      d3.select('#sectionIzq').style('background-color', stateRadiation(radiation.now, 'color'));
    };
    const updateSeccionRadiacionUv = () => {
      // Reset Timer Update
      secondsCount = 0;

      medidorDinamico = medidor(escala((radiation.now <= 11)?(radiation.now):(11)));

      d3.select('#dynamic').attr('d', medidorDinamico());                                         // Medidor
      d3.select('#lvlRadiation').text(radiation.now);                                             // Valor
      d3.select('#state').text(stateRadiation(radiation.now, 'name'));                            // Estado
      d3.select('#recomendation').text(stateRadiation(radiation.now, 'recomendation'));           // Recomendacion
      d3.select('#sectionIzq').transition().style('background-color', stateRadiation(radiation.now, 'color')); // Color Fondo

      if (ubicacion === 'caba') {
        d3.select('#ubication').text('Capital Federal');
      } else {
        d3.select('#ubication').text('Ushuaia');
      }
    };
    const updateRecomendation = () => {
      let container       = $('.protection-icon');
      let protectionLvl   = stateRadiation(radiation.now, 'lvl');

      container.each((k, v) => {

        let element = container.eq(k).attr('id').split('_')[1];

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
    const calculatePronosticDate = (hours) => {
      let dateObj = createObjectDate(true, true);
          dateObj.hour = formatDate(dateObj.date.getHours() + hours);

      let date = `${ dateObj.day }-${ dateObj.month }-${ dateObj.year }`;
      let hour = `${ dateObj.hour }`;

      return { 'fecha': date, 'hora': hour };
    };
    const processPronostic  = (data) => {
      let pronostic = [
        calculatePronosticDate(1),
        calculatePronosticDate(2)
      ];

      data.forEach((v, k) => {

        for (var i = 0; i < pronostic.length; i++) {
          if (v.fecha === pronostic[i].fecha && v.hora === `${ pronostic[i].hora }:00:00`) { pronostic[i].uv = v.indiceUV; }
          pronostic[i].id = i;
        }
      });

      return pronostic;
    };
    const createForecast    = (data) => {
      let pronostic = processPronostic(data);

      let container = d3.select('#forecast');
      let article = container.selectAll('divPronostic')
        .data(pronostic)
        .enter()
        .append('div')
        .attr('class', 'divPronostic');
      article.append('span')
        .attr('class', 'pronostico_horario')
        .text((d) => `${ d.hora }:00`);
      let svg = article.append('svg')
        .attr('class', 'pronostico_barra')
        .attr('viewBox', '0 0 235 15');
      svg.append('line')
        .attr('x1', 7.5)
        .attr('y1', 7.5)
        .attr('x2', 227.5)
        .attr('y2', 7.5)
        .style('fill', 'none')
        .style('stroke', 'silver')
        .style('stroke-linecap', 'round')
        .style('stroke-linejoin', 'round')
        .style('stroke-width', '15px');
      svg.append('line')
        .attr('class', 'dynamic_line')
        .attr('x1', 7.5)
        .attr('y1', 7.5)
        .attr('x2', (d) => (227.5 / sizeObject(radiation.states) * (stateRadiation(d.uv, 'position') + 1)))
        .attr('y2', 7.5)
        .style('fill', 'none')
        .style('stroke', (d) => stateRadiation(d.uv, 'color'))
        .style('stroke-linecap', 'round')
        .style('stroke-linejoin', 'round')
        .style('stroke-width', '15px');
      svg.append('circle')
        .attr('class', 'dynamic_circle')
        .attr('cx', (d) => (227.5 / sizeObject(radiation.states) * (stateRadiation(d.uv, 'position') + 1)))
        .attr('cy', 7.44)
        .attr('r', 5.15)
        .style('fill', 'white')
        .style('stroke', 'none');
      article.append('span')
        .attr('class', 'pronostico_estado')
        .text((d) => stateRadiation(d.uv, 'name'));
    };
    const updateForecast = (data) => {
      let pronostic = processPronostic(data);
      // console.log(pronostic);

      d3.selectAll('.pronostico_horario')
        .data(pronostic)
        .text((d) => `${ d.hora }:00`);
      d3.selectAll('.dynamic_line')
        .data(pronostic)
        .transition()
        .attr('x2', (d) => (227.5 / sizeObject(radiation.states) * (stateRadiation(d.uv, 'position') + 1)))
        .transition()
        .style('stroke', (d) => stateRadiation(d.uv, 'color'));
      d3.selectAll('.dynamic_circle')
        .data(pronostic)
        .transition()
        .attr('cx', (d) => (227.5 / sizeObject(radiation.states) * (stateRadiation(d.uv, 'position') + 1)));
      d3.selectAll('.pronostico_estado')
        .data(pronostic)
        .text((d) => stateRadiation(d.uv, 'name'));
    };
    const getRadiation = (radiacion, recomendation, forecast, history) => {
      let dateObj = createObjectDate(true, true);

      let date = `${ dateObj.day }-${ dateObj.month }-${ dateObj.year }`;
      let hour = `${ dateObj.hour }:${ dateObj.minute }:${ dateObj.second }`;

      $.get(archivo, (data) => {
        let arrData = data.datosRecientes[0].indiceUV;
            arrData.forEach((v, k) => { if (v.fecha === date && v.hora === hour) { radiation.now = v.indiceUV; } });
        dataG = arrData; // Entorno de desarrollo
        // console.log(arrData);
        console.log(radiation.now);
        radiacion();
        recomendation();
        forecast(arrData);
        history(arrData);
      }).fail(() => {
        console.error('Fallo la conexion con la API del SMA');  // Entorno de desarrollo
        setTimeout(getRadiation(radiacion, recomendation, forecast, history), (1000 * 60 * 5));
      });
    };
    const convertElement = (element) => {
      let fecha = element.fecha.split('-');
      let date = new Date(`${ fecha[2] }/${ fecha[1] }/${ fecha[0] } ${ element.hora }`);

      return date;
    };
    const processHistory = (data) => {
      let date = new Date();
      let lastElement = convertElement(data[data.length - 1]);

      while (lastElement > date) {
        data.pop();
        lastElement = convertElement(data[data.length - 1]);
      }

      return data;
    };
    const createHistory = (data) => {
      history.container = d3.select('#lineChart');
      history.width     = history.container.node().getBoundingClientRect().width - history.margin.left - history.margin.right;
      history.height    = history.container.node().getBoundingClientRect().height - history.margin.top - history.margin.bottom;

      let dataset = processHistory(data);
      let date = new Date();

      // Set the ranges
      history.ranges.x = d3.scaleTime().domain([new Date(convertElement(dataset[0])), date]).range([0, history.width]);
      history.ranges.y = d3.scaleLinear().domain([0,13]).range([history.height, 0]);

      // Funciones
      history.graphAxis = (svgElemento, axis, axisName, axisValue, index = false) => {

        if ($(`#${ axisValue }`)) { $(`#${ axisValue }`).remove(); }

        if (axisValue === 'x') {
          let element = svgElemento.append('svg:g')
            .attr('id', axisName)
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + history.height + ')')
            .call(axis);
          if (index === true) {
            element.append('svg:text')
              .attr('class', 'xIndex')
              .attr('transform', 'translate(' + history.width + ', 35)')
              .text('TIEMPO');
          }
        } else {
          let element = svgElemento.append('svg:g')
            .attr('id', axisName)
            .attr('class', 'y axis')
            .attr('transform', 'translate(-40, 0)')
            .call(axis);
          if (index === true) {
            element.append('svg:text')
              .attr('class', 'yIndex')
              .text('UV');
          }
        }
      };
      history.axisFactory = (nameAxis, padding = null) => {

        let axisCreate;

        let textDay = d3.timeFormat('%a');
        let numberDay = d3.timeFormat('%d');
        let month = d3.timeFormat('%b');

        switch (nameAxis) {
          case '12hours':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeHour.every(12))
              .tickFormat(d3.timeFormat('%H:%M'))
              .tickSizeInner(-history.height)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case '24hours':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat(d3.timeFormat('%H:%M'))
              .tickSizeInner(-history.height)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'fullDate':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat((d) => `${textDay(d)}. ${numberDay(d)} ${month(d)}`)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'partDay':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat((d) => `${numberDay(d)}`)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'month':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat((d) => `${month(d)}`)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'axisY':
            axisCreate = d3.axisLeft(history.ranges.y)
              .tickPadding(0)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickValues([0, 3, 6, 8, 11]);
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
      history.line = d3.line().curve(d3.curveBasis)
        .x((d, i) => history.ranges.x(new Date(convertElement(d))))
        .y((d, i) => history.ranges.y(d.indiceUV));
  		history.svg = history.container.append('svg:svg')
        .attr('viewBox', () => {
          let width   = history.width + history.margin.left + history.margin.right;
          let height  = history.height + history.margin.top + history.margin.bottom;
          let viewBox = `0 0 ${ width } ${ height }`;

          return viewBox;
        })
        .style('width', '100%')
        .style('height', '100%');
      history.defs = history.svg.append('svg:defs');
      history.defs.append('svg:pattern')
          .attr('id', 'image')
          .attr('x', 0)
          .attr('y', 0)
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('height', '100%')
          .attr('width', '100%')
        .append('svg:image')
          .attr('x', 0)
          .attr('y', 0)
          .attr('xlink:href', 'public/img/gradient.svg')
          .attr('width', () => history.width)
          .attr('height', () => history.heigth);
      history.graph = history.svg.append('svg:g')
        .attr('transform', 'translate(' + history.margin.left + ',' + history.margin.top + ')');

      history.graphAxis(history.graph, history.axis.xAxisLine1, 'xAxisLine1', 'x', true);
      history.graphAxis(history.graph, history.axis.xAxisLine2, 'xAxisLine2', 'x', false);
      history.graphAxis(history.graph, history.axis.yAxis, 'yAxis', 'y', true);

      history.graph.append('path')
        .attr('id', 'lineChartGraph')
        .attr('d', history.line(dataset))
        .attr('stroke', 'url(#image)')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', '0.5rem');

      let tooltip = history.svg.append('g').attr('id', 'tooltip').attr('class', 'hide');
      let rect    = tooltip.append('rect').attr('class', 'toolRect');
      let text    = tooltip.append('text').attr('class', 'toolText');
      let focus   = tooltip.append('circle').attr('class', 'toolCircle');

      history.voronoi = d3.voronoi()
        .x((d) => history.ranges.x(new Date(convertElement(d))))
        .y((d) => history.ranges.y(d.indiceUV))
        .extent([[0, 0], [history.width, history.height]]);
      history.voronoiGroup = history.svg.append('g')
        .attr('class', 'voronoi')
        .attr('style', 'transform: translate(' + history.margin.left + 'px, ' + history.margin.top + 'px)');
      history.voronoiGroup.selectAll('path')
        .data(history.voronoi(dataset).polygons())
        .enter()
        .append('path')
          .attr('d', (d) => {
            if (d) { return 'M' + d.join('L') + 'Z'; }
          })
          .on('mouseover', (d) => {
            let date = new Date(convertElement(d.data));

            tooltip.attr('class', '').style('transform', `translate(${ history.ranges.x(date) + history.margin.left }px, ${ history.ranges.y(d.data.indiceUV) + history.margin.top - 30 }px)`);
            rect.style('fill', stateRadiation(d.data.indiceUV, 'color'));
            text.text(`${ date.getHours() }:${ date.getMinutes() } HS UV: ${ d.data.indiceUV }`);
            focus.style('stroke', stateRadiation(d.data.indiceUV, 'color'));
          })
          .on('mouseout', (d) => {
            tooltip.attr('class', 'hide');
          });
    };
    const updateHistory = (data) => {
      history.width     = history.container.node().getBoundingClientRect().width - history.margin.left - history.margin.right;
      history.height    = history.container.node().getBoundingClientRect().height - history.margin.top - history.margin.bottom;

      let dataset = processHistory(data);
      let date = new Date();

      // Set the ranges
      history.ranges.x = d3.scaleTime().domain([new Date(convertElement(dataset[0])), date]).range([0, history.width]);

      // Funciones
      const graphAxis = (svgElemento, axis, axisName, axisValue, index = false) => {

        if ($(`#${ axisName }`)) { $(`#${ axisName }`).remove(); }

        if (axisValue === 'x') {
          let element = svgElemento.append('svg:g')
            .attr('id', axisName)
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + history.height + ')')
            .call(axis);
          if (index === true) {
            element.append('svg:text')
              .attr('class', 'xIndex')
              .attr('transform', 'translate(' + history.width + ', 35)')
              .text('TIEMPO');
          }
        } else {
          let element = svgElemento.append('svg:g')
            .attr('id', axisName)
            .attr('class', 'y axis')
            .attr('transform', 'translate(-40, 0)')
            .call(axis);
          if (index === true) {
            element.append('svg:text')
              .attr('class', 'yIndex')
              .text('UV');
          }
        }
      };
      const axisFactory = (nameAxis, padding = null) => {

        let axisCreate;

        let textDay = d3.timeFormat('%a');
        let numberDay = d3.timeFormat('%d');
        let month = d3.timeFormat('%b');

        switch (nameAxis) {
          case '12hours':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeHour.every(12))
              .tickFormat(d3.timeFormat('%H:%M'))
              .tickSizeInner(-history.height)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case '24hours':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat(d3.timeFormat('%H:%M'))
              .tickSizeInner(-history.height)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'fullDate':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat((d) => `${textDay(d)}. ${numberDay(d)} ${month(d)}`)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'partDay':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat((d) => `${numberDay(d)}`)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'month':
            axisCreate = d3.axisBottom(history.ranges.x)
              .ticks(d3.timeDay.every(1))
              .tickFormat((d) => `${month(d)}`)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickPadding(padding);
            break;
          case 'axisY':
            axisCreate = d3.axisLeft(history.ranges.y)
              .tickPadding(0)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickValues([0, 3, 6, 8, 11]);
            break;
        }

        return axisCreate;
      };

      if ($(window).outerWidth() > 600) {
        history.axis.xAxisLine1 = axisFactory('12hours', 10);
        history.axis.xAxisLine2 = axisFactory('fullDate', 30);
      } else {
        history.axis.xAxisLine1 = axisFactory('month', 10);
        history.axis.xAxisLine2 = axisFactory('partDay', 30);
      }

      // Define the line
      history.line = d3.line().curve(d3.curveBasis)
        .x((d, i) => history.ranges.x(new Date(convertElement(d))))
        .y((d, i) => history.ranges.y(d.indiceUV));

      graphAxis(history.graph, history.axis.xAxisLine1, 'xAxisLine1', 'x', true);
      graphAxis(history.graph, history.axis.xAxisLine2, 'xAxisLine2', 'x', false);

      d3.select('#lineChartGraph')
        .attr('d', history.line(dataset));
    };

    getRadiation(crearSeccionRadiacionUv, updateRecomendation, createForecast, createHistory);

    $('#caba').on('click', () => {
      ubicationUpdate('caba');
      getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateForecast, updateHistory);
    });
    $('#ushuaia').on('click', () => {
      ubicationUpdate('ushuaia');
      getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateForecast, updateHistory);
    });

    setInterval(() => { console.log('update'); getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateForecast, updateHistory); }, (1000 * 60 * 10));
  };

  ejecutarReloj();
  ejecutarClima();
  ejecutarRadiacion();

  // Resize Control
  const adjustResponsive = () => {
    let section1 = $('#sectionDer');
    let section2 = $('#section2');

    if (!getResponsive(600)) {
      section1.append(section2.children().children());
    } else {
      section2.children().append(section1.children());
    }
  };
  adjustResponsive();
  $(window).resize(() => {
    let sizeWindow = $(window).outerWidth();

    adjustResponsive();
  });
});
