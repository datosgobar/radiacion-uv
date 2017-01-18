$(document).ready(() => {
  let url = 'http://localhost/Modernizacion/radiacion-uv/public/source/smn.json';

  $.get(url, (data) => {
    let dataJson = JSON.stringify(data);

    $('input').val(dataJson).parent().submit();
  });
});
