<?php
error_reporting(E_ALL);
if(isset($_GET['codcult'])) {
	$imagen = $_GET['codcult'] . "_" . rand(10000, 99999);
	$cpima = curl_init();
	$imgarchv = fopen('imgs/' . $imagen . '.jpg', 'wb');
	curl_setopt($cpima, CURLOPT_URL, 'http://www.culturalianet.com/imatges/articulos/' . $_GET['codcult'] . '-1.jpg');
	curl_setopt($cpima, CURLOPT_BINARYTRANSFER, 1);
	curl_setopt($cpima, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($cpima, CURLOPT_REFERER, 'http://www.culturalianet.com/art/ver.php?art=' . $_GET['codcult']);
	curl_setopt($cpima, CURLOPT_FILE, $imgarchv);
	curl_exec($cpima);
	curl_close($cpima);
	fclose($imgarchv);
	$coment = imagecreatefromjpeg('imgs/' . $imagen . ".jpg");
	header('Content-Type: image/jpeg');
	header('Content-Disposition: inline; filename=poster.jpg');
	imagejpeg($coment);
	imagedestroy($coment);
}
?>