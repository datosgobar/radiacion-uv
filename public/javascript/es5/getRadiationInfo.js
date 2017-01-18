'use strict';

$(document).ready(function () {
  var url = 'http://localhost/Modernizacion/radiacion-uv/public/source/smn.json';

  $.get(url, function (data) {
    var dataJson = JSON.stringify(data);

    $('input').val(dataJson).parent().submit();
  });
});