<?php
error_reporting(E_ALL ^ E_NOTICE);
putenv('GDFONTPATH=' . realpath('.'));
require("base.php");
$mandu = "SELECT id FROM `articulos`";
$mandec = mysql_query($mandu);
$numo = mysql_num_rows($mandec);
$numon = $numo . " críticas publicadas";
		
if ($numo) {
	$fuente = "tahomabd";	
	$fuenta = "book";
	$coment = imagecreatefromgif("garage.gif");
	$coloro = imagecolorallocate($coment, 153, 51, 0);
	imagettftext($coment, 16, 0, 120, 41, $coloro, $fuente, $numon);
	header("Content-Type: image/gif");
	imagegif($coment);
	imagedestroy($coment);
	exit();
}