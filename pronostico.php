<?php

echo '<pre>';
date_default_timezone_set('UTC');

$json = $_POST['pronostico'];
var_dump($json);
$data = json_decode($json, true);
$data = $data['medidas'];

$dayFile = '';
$pronostico = (object) array();

foreach ($data as $key => $value) {
  $date = $value["date"];

  $dayNow = date('Y', strtotime(str_replace('-','/', $date))) . '-' . date('m', strtotime(str_replace('-','/', $date))) . '-' . date('d', strtotime(str_replace('-','/', $date)));

  if ($key === 1) {
    $dayFile = $dayNow;
  }

  // var_dump(empty($pronostico->$dayNow));exit;

  if (empty($pronostico->$dayNow)) {
    $day = $pronostico->$dayNow = (object) array();
  }

  $hourNow = date('H', strtotime(str_replace('-','/', $date)));

  if (empty($day->$hourNow)) {
    $hour = $day->$hourNow = (object) array();
  }

  $minuteNow = date('i', strtotime(str_replace('-','/', $date)));

  $pronostico->$dayNow->$hourNow->$minuteNow = $value['uv'];
};

$json = json_encode($pronostico);

$path = 'public/source/';
$nameFile = $path . 'pronostico' . '-' . $dayFile . '.json';

if (!file_exists($nameFile)) {
  echo "El archivo no existe";
  file_put_contents($nameFile, $json);
}



?>
