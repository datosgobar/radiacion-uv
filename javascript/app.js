'use strict';

$(document).ready(function () {
  // FullPage Configuration
  $('#fullpage').fullpage({
    //Navigation
    menu: '#menu',
    lockAnchors: false,
    anchors: ['Vivo', 'Info'],
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['Vivo', 'Info'],
    showActiveTooltip: false,
    slidesNavigation: false,
    slidesNavPosition: 'bottom',

    //Scrolling
    css3: true,
    scrollingSpeed: 700,
    autoScrolling: true,
    fitToSection: true,
    fitToSectionDelay: 1000,
    scrollBar: false,
    easing: 'easeInOutCubic',
    easingcss3: 'ease',
    loopBottom: false,
    loopTop: false,
    loopHorizontal: true,
    continuousVertical: false,
    continuousHorizontal: false,
    scrollHorizontally: false,
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
    sectionsColor: ['silver', 'gray'],
    paddingTop: '0px',
    paddingBottom: '0px',
    fixedElements: '#header, .footer',
    responsiveWidth: 0,
    responsiveHeight: 0,
    responsiveSlides: false,

    //Custom selectors
    sectionSelector: '.section',
    slideSelector: '.slide',
    lazyLoading: true,

    //events
    onLeave: function onLeave(index, nextIndex, direction) {},
    afterLoad: function afterLoad(anchorLink, index) {},
    afterRender: function afterRender() {},
    afterResize: function afterResize() {},
    afterResponsive: function afterResponsive(isResponsive) {},
    afterSlideLoad: function afterSlideLoad(anchorLink, index, slideAnchor, slideIndex) {},
    onSlideLeave: function onSlideLeave(anchorLink, index, slideIndex, direction, nextSlideIndex) {}
  });

  // Medidor D3
  var radiation = {
    min: 0,
    max: 15,
    now: 1,
    size: 200,
    states: {
      extrem: { name: "Extremadamente Alto", color: "#800080", minValue: 11 },
      very: { name: "Muy Alto", color: "#FF0000", minValue: 8 },
      higth: { name: "Alto", color: "#FFA500", minValue: 6 },
      moderate: { name: "Moderado", color: "#FFFF00", minValue: 3 },
      low: { name: "Bajo", color: "#008000", minValue: 0 }
    }
  };
  var scaleRadiation = d3.scaleLinear().domain([radiation.min, radiation.max]).range([5, 11]);
  var measureRadiation = function measureRadiation(radiation_uv) {
    var medidor_uv = d3.arc().innerRadius(80).outerRadius(100).startAngle(Math.PI / 4 * 5).endAngle(Math.PI / 4 * scaleRadiation(radiation_uv)).cornerRadius(20);

    return medidor_uv;
  };
  var stateRadiation = function stateRadiation(radiation_lvl, data) {
    for (var state in radiation.states) {
      if (radiation_lvl > radiation.states[state].minValue) {
        if (data === "color") {
          return radiation.states[state].color;
        } else if (data === "name") {
          return radiation.states[state].name;
        }
      }
    }
  };

  var measure = d3.arc().innerRadius(80).outerRadius(100).startAngle(Math.PI / 4 * 5).endAngle(Math.PI / 4 * 11).cornerRadius(20);
  var measure_uv = measureRadiation(radiation.now);
  var svgContainer = d3.select("#medidor").append("svg").attr("width", radiation.size).attr("height", radiation.size);

  svgContainer.append("text").attr("id", "radiationNow").attr("text-anchor", "middle").attr("alignment-baseline", "central").style("fill", "white").style("font-size", 80).style("transform", function () {
    return "translate(" + radiation.size / 2 + "px, " + (radiation.size / 2 - 20) + "px)";
  }).text(radiation.now);

  svgContainer.append("text").attr("text-anchor", "middle").attr("alignment-baseline", "central").style("fill", "white").style("font-size", 12).style("transform", function () {
    return "translate(" + radiation.size / 2 + "px, " + (radiation.size / 2 + 30) + "px)";
  }).text("Indice UV");

  svgContainer.append("text").attr("id", "stateRadiation").attr("text-anchor", "middle").attr("alignment-baseline", "central").style("fill", "white").style("font-size", 20).style("transform", function () {
    return "translate(" + radiation.size / 2 + "px, " + (radiation.size / 2 + 50) + "px)";
  }).text(stateRadiation(radiation.now, "name"));

  svgContainer.append("path").style("fill", "white").style("opacity", 0.5).style("transform", function () {
    return "translate(" + radiation.size / 2 + "px, " + radiation.size / 2 + "px)";
  }).attr("d", measure());

  svgContainer.append("path").style("fill", stateRadiation(radiation.now, "color")).style("transform", function () {
    return "translate(" + radiation.size / 2 + "px, " + radiation.size / 2 + "px)";
  }).attr("d", measure_uv());

  var generateRadiation = function generateRadiation() {
    console.log(radiation.now);
    radiation.now = radiation.now + 1; // Entorno de desarrollo
    $('#radiationNow').text(radiation.now);
    $('#stateRadiation').text(stateRadiation(radiation.now, "name"));
    $('#medidor svg').children().last().css({ "fill": stateRadiation(radiation.now, "color") }).attr('d', measureRadiation(radiation.now));
  };

  var times = [3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000, 300000, 33000, 36000, 39000];
  times.forEach(function (i, v) {
    setTimeout(function () {
      generateRadiation();
    }, times[v]);
  });

  window.generateRadiation = generateRadiation;
});
