// Detectar si es mobile
(function(a) {
    (jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
})(navigator.userAgent || navigator.vendor || window.opera);

$(document).ready(() => {

  // FullPage Configuration
  $('#fullpage').fullpage({
      //Navigation
      menu: '#menu',
      lockAnchors: false,
      anchors: [],
      navigation: false,
      navigationPosition: 'right',
      navigationTooltips: [],
      showActiveTooltip: false,
      slidesNavigation: true,
      slidesNavPosition: 'bottom',

      //Scrolling
      css3: true,
      scrollingSpeed: 700,
      autoScrolling: (jQuery.browser.mobile) ? false : true,
      fitToSection: true,
      fitToSectionDelay: 1000,
      scrollBar: false,
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
      keyboardScrolling: true,
      animateAnchor: true,
      recordHistory: true,

      //Design
      controlArrows: true,
      verticalCentered: true,
      sectionsColor : ['white', 'white', 'white', 'white', 'white'],
      paddingTop: $('#navBar').outerHeight(),
      paddingBottom: '0px',
      fixedElements: '#header, .footer',
      responsiveWidth: 0,
      responsiveHeight: 0,
      responsiveSlides: false,

      //Custom selectors
      sectionSelector: '.sectionFullPage',
      slideSelector: '.slide',
      lazyLoading: true,

      //events
      onLeave: function(index, nextIndex, direction){},
      afterLoad: function(anchorLink, index){},
      afterRender: function(){},
      afterResize: function(){},
      afterResponsive: function(isResponsive){},
      afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex){},
      onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex){}
  });

  // Funciones Medidor
  const radiation = {
    min: 0,
    max: 15,
    now: { number: 1, float: 1, decimal: 0},
    diameter: (($('#section1 > div > section').outerWidth() * 0.9) > 350) ? (350) : ($('#section1 > div > section').outerWidth() * 0.9),
    anchor: 15,
    states: {
      extrem: { name:'Peligroso', color: 'rgba(26, 10, 58, 1)', minValue: 11, recomendation: 'Esta es una recomendacion para el estado UV extremadamente alto' },
      very: { name: 'Muy Alto', color: 'rgba(242, 56, 90, 1)', minValue: 8, recomendation: 'Esta es una recomendacion para el estado UV muy alto' },
      higth: { name: 'Alto', color: 'rgba(241, 133, 75, 1)', minValue: 6, recomendation: 'Esta es una recomendacion para el estado UV alto' },
      moderate: { name: 'Moderado', color: 'rgba(233, 184, 66, 1)', minValue: 3, recomendation: 'Esta es una recomendacion para el estado UV moderado' },
      low: { name: 'Bajo', color: 'rgba(66, 190, 92, 1)', minValue: 0, recomendation: 'Esta es una recomendacion para el estado UV bajo' }
    }
  };
  const scaleRadiation = d3.scaleLinear().domain([radiation.min, radiation.max]).range([5, 11]);
  const measureRadiation = (inicial = '') => {

    let radiationVal = (inicial === 'inicial') ? 11 : scaleRadiation(radiation.now.number);

    let medidorUv = d3.arc()
      .outerRadius((radiation.diameter / 2))
      .innerRadius((radiation.diameter / 2) - radiation.anchor)
      .startAngle((Math.PI / 4) * 5)
      .endAngle((Math.PI / 4) * radiationVal)
      .cornerRadius(radiation.anchor);

    return medidorUv;
  };
  const stateRadiation = (radiationLvl, data) => {
    for (var state in radiation.states) {
      if (radiationLvl > radiation.states[state].minValue) {
        return radiation.states[state][data];
      }
    }
  };

  // Secuential Start Functions
  const start = () => {
    const xmlToJson = (xml) => {

      let obj = {};

      if (xml.nodeType === 1) {
        if (xml.attributes.length > 0) {
            obj['@attributes'] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
              let attribute = xml.attributes.item(j);
              obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
            }
        }
      } else if (xml.nodeType === 3) {
        obj = xml.nodeValue;
      }

      if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
          var item = xml.childNodes.item(i);
          var nodeName = item.nodeName;
          if (typeof(obj[nodeName]) === 'undefined') {
            obj[nodeName] = xmlToJson(item);
          } else {
            if (typeof(obj[nodeName].push) === 'undefined') {
              var old = obj[nodeName];
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xmlToJson(item));
          }
        }
      }

      return obj;
    };
    const formatDate = (date) => {
      return (date > 9) ? (date) : (`0${date}`);
    };
    const average = (array) => {
      let total = 0;

      array.forEach((v, k) => {
        total = total + v;
      });

      total = total / array.length;

      return total;
    };
    const forecastCalculate = () => {
      let now = new Date();
      let averageArray = [];

      for (var i = 1; i < 4; i++) {
        averageArray[(now.getHours() + i)] = [];
      }

      $.get('http://geouv.citedef.gob.ar/api/uvDiario/581b4637445ea55b1b1769f3', (data) => {

        data.medidas.forEach((v, k) => {
          let date = new Date(v.date);

          if ((now.getHours() + 1) === date.getHours()) {
            averageArray[date.getHours()].push(v.uv);
          } else if ((now.getHours() + 2) === date.getHours()) {
            averageArray[date.getHours()].push(v.uv);
          } else if ((now.getHours() + 3) === date.getHours()) {
            averageArray[date.getHours()].push(v.uv);
          }
        });

        $('#forecast').empty();

        averageArray.forEach((v, k) => {
          $('#forecast').append(`<article>
            <svg height="50" width="50"><circle cx="25" cy="25" r="25" fill="${ stateRadiation(average(averageArray[k]), 'color') }"/></svg>
            <span class="horario">${ formatDate(k) }:00</span>
            <span class="pronostico">${ stateRadiation(average(averageArray[k]), 'name') }</span>
          </article>`);
        });
      });
    };
    const clock = () => {
      let date = new Date();
      let hours = formatDate(date.getHours());
      let minutes = formatDate(date.getMinutes());

      $('#clock').text(`${hours} : ${minutes} hs`);

      if (minutes === '00') {
        forecastCalculate();
      }

      setTimeout(clock, 1000);
    };
    const getWeather = () => {
      let config = {
        apiKey: 'yKc5A0AbGdhwkdp54ARjrnw22YAYwxXf',
        lenguage: 'es-ar',
        details: true
      };

      let url = `http://dataservice.accuweather.com/currentconditions/v1/7893.json?apikey=${ config.apiKey }&language=${ config.lenguage }&details=${ config.details }`;

      $.get(url, (data) => {
        xmlToJson(data).report.location.day.forEach((v,k) => {
          let date = new Date();
          let currentDate = `${ date.getFullYear() }${ date.getMonth() + 1 }${ date.getDate() }`;

          if (v['@attributes'].value === currentDate) {
            console.log(v);
          }
        });
      });

      setTimeout(getWeather, (1000 * 60 * 60));
    };

    //getWeather();
    clock();
    forecastCalculate();
  };

  // Update Date
  const generateRadiation = () => {

    let valueRadiation = ((Math.random() * 15) + 1);
    let formatValue = valueRadiation.toString().split('.');

    radiation.now.number = valueRadiation;
    radiation.now.float = parseInt(formatValue[0]);
    radiation.now.decimal = parseInt(formatValue[1].slice(0, 1));


    $('#dinamic').attr('d', measureRadiation());
    $('#lvlRadiation').text(radiation.now.float);

    if (radiation.now.decimal !== 0) {
      $('#lvlRadiationD').text(`, ${ radiation.now.decimal }`);
    } else {
      $('#lvlRadiationD').empty();
    }

    $('#state').empty().text(stateRadiation(radiation.now.float, 'name'));
    $('#section1 > div > section').css({ 'backgroundColor': stateRadiation(radiation.now.float, 'color') });
    $('#recomendation').empty().text(stateRadiation(radiation.now.float, 'recomendation'));
  };

  let measure = measureRadiation('inicial');
  let measureUv = measureRadiation();

  let svgContainer = d3.select('#medidor')
    .append('svg')
    .attr('width', radiation.diameter)
    .attr('height', function(){
      return radiation.diameter - ((radiation.diameter / 2) * 0.29289);
    })
    .attr('viewBox', function(){
      let height = radiation.diameter - ((radiation.diameter / 2) * 0.29289);
      let diameter = radiation.diameter;
      let viewBox = `0 0 ${diameter} ${height}`;

      return viewBox;
    });

  svgContainer.append('path') // Medidor Estatico
    .style('fill', 'black')
    .style('opacity', 0.1)
    .style('transform', () => {
      return 'translate(' + (radiation.diameter / 2) + 'px, ' + (radiation.diameter / 2) + 'px)';
    })
    .attr('d', measure());
  svgContainer.append('path') // Medidor Dinamico
    .attr('id', 'dinamic')
    .style('fill', 'white')
    .style('transform', () => {
      return 'translate(' + (radiation.diameter / 2) + 'px, ' + (radiation.diameter / 2) + 'px)';
    })
    .attr('d', measureUv());
  svgContainer.append('text') // Hora
    .attr('id', 'clock')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'central')
    .style('fill', 'white')
    .style('font-weight', 100)
    .style('font-size', '1.75rem')
    .style('transform', () => {
      return 'translate(' + ((radiation.diameter / 2)) + 'px, ' + ((radiation.diameter / 4)) + 'px)';
    });
  svgContainer.append('text') // Nivel de Radiacion UV
    .attr('id', 'lvlRadiation')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'end')
    .style('fill', 'white')
    .style('font-size', '15rem');
  svgContainer.append('text') // Nivel de Radiacion UV (decimales)
    .attr('id', 'lvlRadiationD')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'end')
    .style('fill', 'white')
    .style('font-size', '3rem');

  start();
  generateRadiation();

  $('#lvlRadiation').css({ 'transform': `translate(${ (radiation.diameter / 2) - ($('#lvlRadiationD').outerWidth() / 2) }px, ${ (radiation.diameter / 4) * 3 }px` });
  $('#lvlRadiationD').css({ 'transform': `translate(${ (radiation.diameter / 2) + ($('#lvlRadiation').outerWidth() / 2) }px, ${ (radiation.diameter / 4) * 3 }px` });
  $('.slide .fp-tableCell').attr('style', '');















});
