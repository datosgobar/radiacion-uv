let secondsCount = 0;
let updateHistory;
let arrData;
let position = 40;

let chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
let darken = (c,n,i,d) => {for(i=3;i--;c[i]=d<0?0:d>255?255:d|0)d=c[i]+n;return c};

let spanish = {
  'dateTime': '%A, %e de %B de %Y, %X',
  'date': '%d/%m/%Y',
  'time': '%H:%M:%S',
  'periods': ['AM', 'PM'],
  'days': ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  'shortDays': ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  'months': ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  'shortMonths': ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
};

let spanishFormatDate = d3.timeFormatDefaultLocale(spanish);
let d3Format = d3.timeFormat('%c');

// Funciones Globales
const formatDate = (date) => ((date > 9) ? (date) : (`0${date}`));
const createObjectDate = (roundMinutes = false, roundSeconds = false) => {
  let dateObj = {};
      dateObj.date    = new Date();
      dateObj.year    = dateObj.date.getFullYear();
      dateObj.month   = formatDate(dateObj.date.getMonth() + 1);
      dateObj.day     = formatDate(dateObj.date.getDate());
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
const getResponsive = (max) => ($(window).outerWidth() < max) ? (true) : (false);

$(document).ready(() => {
  const ejecutarReloj = () => {
    const updateClock = () => {
      let dateObj = createObjectDate(false, false);

      secondsCount++;
      if ((secondsCount % 2) === 0) {
        $('#time').empty().append(dateObj.hour + '<span>:</span>' +  dateObj.minute);
      } else {
        $('#time').empty().append(dateObj.hour + '<span class="transparent">:</span>' +  dateObj.minute);
      }
    };
    const updateStateClock = (seconds) => {
      let minutes = Math.floor(seconds / 60);

      if (minutes === 0) {
        d3.select('#actualizacion').text('ACTUALIZADO');
      } else if (minutes === 1) {
        d3.select('#actualizacion').text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTO');
      } else {
        d3.select('#actualizacion').text('ÚLTIMA ACTUALIZACION HACE ' + minutes + ' MINUTOS');
      }
    };

    setInterval(() => {
      updateClock();
      updateStateClock(secondsCount);
    }, 1000);
  };
  const ejecutarRadiacion = () => {
    let radiation = {
      max       : 11,
      min       : 0,
      now       : 0,
      diameter  : $('#medidor').outerWidth(),
      anchor    : 15,
      states    : {
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
    let medidorDinamico;
    let medidorPunto;
    let medidor;
    let medPunto;
    let escala;
    let ahora;
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
      medidor = (final) => d3.arc()
          .outerRadius((radiation.diameter / 2))
          .innerRadius((radiation.diameter / 2) - radiation.anchor)
          .startAngle((Math.PI / 4) * 5)
          .endAngle((Math.PI / 4) * final)
          .cornerRadius(radiation.anchor);
      medPunto = (inicial, final) => d3.arc()
          .outerRadius((radiation.diameter / 2) - (radiation.anchor / 4))
          .innerRadius((radiation.diameter / 2) - radiation.anchor + (radiation.anchor / 4))
          .startAngle((Math.PI / 4) * inicial)
          .endAngle((Math.PI / 4) * final)
          .cornerRadius(radiation.anchor);

      let maximo = escala(radiation.max)
      ahora = escala((radiation.now <= 11)?(radiation.now):(11));

      let medidorEstatico = medidor(maximo);
      medidorDinamico = medidor(ahora);
      medidorPunto = medPunto((ahora - 0.07 - 0.04), (ahora - 0.04));

      let svg = contenedorMedidor.append('svg')
        .attr('id', 'svgMedidor')
        .attr('viewBox', () => `0 0 ${ (radiation.diameter) } ${ (radiation.diameter - ((radiation.diameter / 2) * 0.29289)) }`);
      svg.append('path')        // Medidor Estatico
        .attr('d', medidorEstatico())
        .attr('class', 'staticMeasure')
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -moz-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -webkit-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);`;
        });
      svg.append('svg:path')    // Medidor Dinamico
        .attr('id', 'dynamic')
        .attr('d', medidorDinamico())
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -moz-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -webkit-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);`;
        });
      svg.append('svg:path')    // Nuevo Medidor
        .attr('id', 'medidorPunto1')
        .attr('d', medidorPunto())
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -moz-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -webkit-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);`;
        })
        .style('fill', () => stateRadiation(radiation.now, 'color'));
      svg.append('svg:path')    // Nuevo Medidor
        .attr('id', 'medidorPunto2')
        .attr('d', medidorPunto())
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -moz-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);
                  -webkit-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 2) }px);`;
        })
        .style('fill', 'rgba(0, 0, 0, 0.1)');

      svg.append('svg:text')    // Texto UV
        .attr('class', 'measureText')
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 3.5 }px) translateY(3.5rem);
                  -moz-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 3.5 }px) translateY(3.5rem);
                  -webkit-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 3.5 }px) translateY(3.5rem);`;
        })
        .text('UV');
      svg.append('svg:text')    // vMin
        .attr('class', 'measureMinMax')
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 8) * 0.5 }px, ${ (radiation.diameter / 8) * 6.75 }px);
                  -moz-transform: translate(${ (radiation.diameter / 8) * 0.5 }px, ${ (radiation.diameter / 8) * 6.75 }px);
                  -webkit-transform: translate(${ (radiation.diameter / 8) * 0.5 }px, ${ (radiation.diameter / 8) * 6.75 }px);`;
        })
        .text('0');
      svg.append('svg:text')    // vMax
        .attr('class', 'measureMinMax')
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 8) * 7.5 }px, ${ (radiation.diameter / 8) * 6.75 }px);
                  -moz-transform: translate(${ (radiation.diameter / 8) * 7.5 }px, ${ (radiation.diameter / 8) * 6.75 }px);
                  -webkit-transform: translate(${ (radiation.diameter / 8) * 7.5 }px, ${ (radiation.diameter / 8) * 6.75 }px);`;
        })
        .text('11+');

      svg.append('svg:text')    // Estado
        .attr('id', 'state')
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 5.4 }px);
                  -moz-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 5.4 }px);
                  -webkit-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 5.4 }px);`;
        })
        .text(stateRadiation(radiation.now, 'name'));
      svg.append('svg:text')    // Valor
        .attr('id', 'lvlRadiation')
        .attr('style', () => {

          return `transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 6.3 }px);
                  -moz-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 6.3 }px);
                  -webkit-transform: translate(${ (radiation.diameter / 2) }px, ${ (radiation.diameter / 8) * 6.3 }px);`;
        })
        .text(radiation.now);

      d3.select('#recomendation').text(stateRadiation(radiation.now, 'recomendation'));
      d3.select('#sectionIzq').style('background-color', stateRadiation(radiation.now, 'color'));
    };
    const updateSeccionRadiacionUv = () => {
      // Reset Timer Update
      secondsCount = 0;

      ahora = escala((radiation.now <= 11)?(radiation.now):(11));

      medidorDinamico = medidor(ahora);
      medidorPunto = medPunto((ahora - 0.07 - 0.04), (ahora - 0.04));

      d3.select('#dynamic').attr('d', medidorDinamico());                                         // Medidor
      d3.select('#medidorPunto1').attr('d', medidorPunto()).style('fill', () => stateRadiation(radiation.now, 'color'));                                         // Medidor
      d3.select('#medidorPunto2').attr('d', medidorPunto());                                         // Medidor
      d3.select('#lvlRadiation').text(radiation.now);                                             // Valor
      d3.select('#state').text(stateRadiation(radiation.now, 'name'));                            // Estado
      d3.select('#recomendation').text(stateRadiation(radiation.now, 'recomendation'));           // Recomendacion
      d3.select('#sectionIzq').transition().style('background-color', stateRadiation(radiation.now, 'color')); // Color Fondo
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
    const standarDate = (dato) => {
      // console.log(dato);
      let fecha = dato.fecha.split('-');
      let hora = dato.hora.split(':');

      let datoFecha = new Date(`${ fecha[2] }/${ fecha[1] }/${ fecha[0] } ${ hora[0] }:${ hora[1] }:${ hora[2] }`);
          datoFecha.setHours(datoFecha.getHours() - 3);

      dato.fecha = `${ formatDate(datoFecha.getDate()) }-${ formatDate(datoFecha.getMonth() + 1) }-${ datoFecha.getFullYear() }`;
      dato.hora = `${ formatDate(datoFecha.getHours()) }:${ formatDate(datoFecha.getMinutes()) }:${ formatDate(datoFecha.getSeconds()) }`;

      return dato;
    };
    const getRadiation = (radiacion, recomendation, history, force = false) => {
      let dateObj = createObjectDate(true, true);

        $.get('public/source/caba.json', (data) => {
          arrData = data.datosRecientes[0].indiceUV;

          radiation.now = arrData[arrData.length - 1].indiceUV;

          if (dateObj.hour >= 21) {
            radiation.states.hide.recomedation = 'El sol está durmiendo. ¡Hasta luego!';
          } else {
            radiation.states.hide.recomedation = 'El día está feo y la radiación es muy baja.';
          }

          arrData.forEach((v, k) => { v = standarDate(v); });

          console.log('Se hace pedido GET');
          radiacion();
          recomendation();
          history(arrData);
        });
    };
    const convertElement = (element) => {
      // console.log(element);
      let fecha = element.fecha.split('-');
      let date = `${ formatDate(fecha[2]) }/${ formatDate(fecha[1]) }/${ formatDate(fecha[0]) } ${ element.hora }`;

      return date;
    };
    const createHistory = (data) => {
      history.container = d3.select('#lineChart');
      history.width     = history.container.node().getBoundingClientRect().width - history.margin.left - history.margin.right;
      history.height    = history.container.node().getBoundingClientRect().height - history.margin.top - history.margin.bottom;

      let dataset = data;

      // Set the ranges
      history.ranges.x = d3.scaleTime().domain([new Date(convertElement(dataset[0])), new Date()]).range([0, history.width]);
      history.ranges.y = d3.scaleLinear().domain([0,13]).range([history.height, 0]);

      // Funciones
      history.graphAxis = (svgElemento, axis, axisName, axisValue, index = false) => {

        if ($(`#${ axisValue }`)) { $(`#${ axisValue }`).remove(); }

        if (axisValue === 'x') {
          let element = svgElemento.append('svg:g')
            .attr('id', axisName)
            .attr('class', 'x axis')
            .attr('style', () => {

              return `transform: translate(0px, ${ history.height }px);
                      -moz-transform: translate(0px, ${ history.height }px);
                      -webkit-transform: translate(0px, ${ history.height }px);`;
            })
            .call(axis);
          if (index === true) {
            element.append('svg:text')
              .attr('class', 'xIndex')
              .attr('style', () => {

                return `transform: translate(${ history.width }px, 35px);
                        -moz-transform: translate(${ history.width }px, 35px);
                        -webkit-transform: translate(${ history.width }px, 35px);`;
              })
              .text('TIEMPO');
          }
        } else {
          let element = svgElemento.append('svg:g')
            .attr('id', axisName)
            .attr('class', 'y axis')
            .attr('style', () => {

              return `transform: translate(-20px, 0px);
                      -moz-transform: translate(-20px, 0px);
                      -webkit-transform: translate(-20px, 0px);`;
            })
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
        .attr('id', 'historyChart')
        .attr('height', '100%')
        .attr('weigth', '100%')
        .attr('viewBox', () => {
          let width   = history.width + history.margin.left + history.margin.right;
          let height  = history.height + history.margin.top + history.margin.bottom;
          let viewBox = `0 0 ${ width } ${ height }`;

          return viewBox;
        });
      history.defs = history.svg.append('svg:defs');
      history.defs.append('svg:pattern')
          .attr('id', 'image')
          .attr('x', 0)
          .attr('y', 0)
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('height', '100%')
          .attr('width', '100%')
        .append('svg:image')
          .attr('id', 'mascara')
          .attr('y', 0)
          .attr('x', 0)
          .attr('xlink:href', 'public/img/gradient.svg')
          .attr('width', () => history.width)
          .attr('height', () => history.height);
      history.graph = history.svg.append('svg:g')
        .attr('style', () => {
          return `transform: translate(${ history.margin.left }px, ${ history.margin.top }px);
                  -moz-transform: translate(${ history.margin.left }px, ${ history.margin.top }px);
                  -webkit-transform: translate(${ history.margin.left }px, ${ history.margin.top }px);`;
        });

      history.graphAxis(history.graph, history.axis.xAxisLine1, 'xAxisLine1', 'x', true);
      history.graphAxis(history.graph, history.axis.xAxisLine2, 'xAxisLine2', 'x', false);
      history.graphAxis(history.graph, history.axis.yAxis, 'yAxis', 'y', true);

      history.graph.append('path')
        .attr('id', 'lineChartGraph')
        .attr('d', history.line(dataset))
        .attr('stroke', () => {
          if (chrome) {
            return 'url(#image)';
          } else {
            return 'rgba(255, 255, 255, 0.5)';
          }
        })
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', '0.5rem');

      let tooltip = history.svg.append('g').attr('id', 'tooltip').attr('class', 'hide');
      let rect    = tooltip.append('rect').attr('class', 'toolRect').attr('rx', '10px').attr('ry', '10px');
      let text    = tooltip.append('text').attr('class', 'toolText');
      let focus   = tooltip.append('circle').attr('class', 'toolCircle').attr('r', '8px');

      history.voronoi = d3.voronoi()
        .x((d) => history.ranges.x(new Date(convertElement(d))))
        .y((d) => history.ranges.y(d.indiceUV))
        .extent([[0, 0], [history.width, history.height]]);
      history.voronoiGroup = history.svg.append('g')
        .attr('class', 'voronoi')
        .attr('style', () => {
          return `transform: translate(${ history.margin.left }px, ${ history.margin.top }px);
                  -moz-transform: translate(${ history.margin.left }px, ${ history.margin.top }px);
                  -webkit-transform: translate(${ history.margin.left }px, ${ history.margin.top }px);`;
        });

      history.voronoiGroup.selectAll('path')
        .data(history.voronoi(dataset).polygons())
        .enter()
        .append('path')
          .attr('d', (d) => {
            if (d) { return 'M' + d.join('L') + 'Z'; }
          })
          .on('mouseover', (d) => {
            let date = new Date(convertElement(d.data));

            tooltip.attr('class', '')
            .attr('style', () => {
              return `transform: translate(${ history.ranges.x(date) + history.margin.left }px, ${ history.ranges.y(d.data.indiceUV) + history.margin.top - 30 }px);
                      -moz-transform: translate(${ history.ranges.x(date) + history.margin.left }px, ${ history.ranges.y(d.data.indiceUV) + history.margin.top - 30 }px);
                      -webkit-transform: translate(${ history.ranges.x(date) + history.margin.left }px, ${ history.ranges.y(d.data.indiceUV) + history.margin.top - 30 }px);`;
            });

            rect.style('fill', () => {
              if (d.data.indiceUV == 0) {
                return stateRadiation(2, 'color');
              } else {
                return stateRadiation(d.data.indiceUV, 'color');
              }
            });

            text.text(`${ formatDate(date.getHours()) }:${ formatDate(date.getMinutes()) } | UV ${ d.data.indiceUV }`);
          })
          .on('mouseout', (d) => {
            tooltip.attr('class', 'hide');
          });
    };
    updateHistory = (data) => {
      $('#lineChart').empty();
      createHistory(data);
    };

    getRadiation(crearSeccionRadiacionUv, updateRecomendation, createHistory, true);

    $('#flecha_izq').on('click', () => {
      d3.select('#slides')
        .transition()
        .attr('style', () => {
          position = position + 20;

          if (position === 40 ) {
            d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
            $('#flecha_izq').hide();
          } else if (position === (- 40)) {
            d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
            $('#flecha_der').hide();
          } else {
            d3.select('.buttonSlideCenter').attr('class', 'buttonSlideSpace');
            $('#flecha_izq').show();
            $('#flecha_der').show();
          }

          return `transform: translateX(${ position }%);
                  -moz-transform: translateX(${ position }%);
                  -webkit-transform: translateX(${ position }%);`;
        });
    });
    $('#flecha_der').on('click', () => {
      d3.select('#slides')
        .transition()
        .attr('style', () => {
          position = position - 20;

          if (position === 40 ) {
            d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
            $('#flecha_izq').hide();
          } else if (position === (- 40)) {
            d3.select('.buttonSlideSpace').attr('class', 'buttonSlideCenter');
            $('#flecha_der').hide();
          } else {
            d3.select('.buttonSlideCenter').attr('class', 'buttonSlideSpace');
            $('#flecha_izq').show();
            $('#flecha_der').show();
          }

          return `transform: translateX(${ position }%);
                  -moz-transform: translateX(${ position }%);
                  -webkit-transform: translateX(${ position }%);`;
        });
    });

    setInterval(() => { getRadiation(updateSeccionRadiacionUv, updateRecomendation, updateHistory); }, (1000 * 60 * 1));
  };
  const adjustResponsive = () => {
    let section1 = $('#sectionDer');
    let section2 = $('#section2');

    if (!getResponsive(600)) {
      section1.append(section2.children().children());

      $('#flecha_izq').hide();
      $('#flecha_der').hide();

      $('.iconos-derecha').show();
      $('.iconos-izquierda').show();

      d3.select('#slides')
        .attr('style', () => {

          return `transform: translateX(0%);
                  -moz-transform: translateX(0%);
                  -webkit-transform: translateX(0%);`;
        });
    } else {
      section2.children().append(section1.children());

      $('#flecha_izq').show();
      $('#flecha_der').show();

      $('.iconos-derecha').hide();
      $('.iconos-izquierda').hide();

      if (position === 40 ) {
        $('#flecha_izq').hide();
      } else if (position === (- 40)) {
        $('#flecha_der').hide();
      } else {
        $('#flecha_izq').show();
        $('#flecha_der').show();
      }

      d3.select('#slides')
        .attr('style', () => {

          return `transform: translateX(40%);
                  -moz-transform: translateX(40%);
                  -webkit-transform: translateX(40%);`;
        });
    }
  };

  ejecutarReloj();
  ejecutarRadiacion();
  adjustResponsive();

  $(window).resize(() => {
    adjustResponsive();
    updateHistory(arrData);
  });
});
