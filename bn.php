<?php
if (empty($estaentradafecha)) {
    header("Location: index.php");
    exit;
}
if (isset($_GET['isbnleido'])) {
    if ($_GET['nuevselec'] == "true") {
        $isbn_ob = $_GET['isbnleido'];
    } else {
        $base    = substr($_GET['isbnleido'], 3, 9);
        $valor   = dctrl_isbn10($base);
        $isbn_ob = $base . $valor;
    }
}
if (isset($_GET['isbnleido']) && empty($isbn_ob)) {
    bibmsg('Ha ocurrido un error al tratar de obtener un ISBN válido a partir de la lectura del código de barras.', 'er', 'Reintentar', 'GET', 'bibliotecalector', 'no');
} else {
    if (empty($_GET['itemsel']) == false && empty($_GET['urlsel']) == false) {
        $aleat       = $_GET['urlsel'];
        $url3        = $_SESSION[$aleat] . $_GET['itemsel'];
        $temp        = file_get_contents($url3);
        $analizarbnm = "si";
    } else {
        $temp   = file_get_contents('http://www.bncatalogo.cl/F/-/?func=find-b-0&local_base=BIBLIOTECA_NACIONAL');
        $bnmses = entre($temp, 'action="http://www.bncatalogo.cl:80/F', '">');
        if (isset($_GET['isbnleido'])) {
            $url = "http://www.bncatalogo.cl/F" . $bnmses . "?func=find-d&local_base=LIBROS_W&find_code=ISBN&request=" . $isbn_ob . "&adjacent1=N&find_code=WRD&request=&adjacent2=N&find_code=WRD&request=&adjacent3=N&local_base=BIBLIOTECA&x=35&y=6&filter_code_1=WLN&filter_request_1=&filter_code_2=WYR&filter_request_2=&filter_code_3=WYR&filter_request_3=&filter_code_4=WFM&filter_request_4=BK&filter_code_5=WSL&filter_request_5";
        } else {
            $url = "http://www.bncatalogo.cl/F" . $bnmses . "?func=find-d&local_base=LIBROS_W&find_code=ISBN&request=" . $_POST['f_isbn'] . "&adjacent1=N&find_code=WTI&request=" . urlencode(utf8_encode(eliminararticulos(trim(als2($_POST['f_titulo']))))) . "&adjacent2=N&find_code=WAU&request=" . urlencode(utf8_encode(trim($_POST['f_autor']))) . "&adjacent3=N&local_base=BIBLIOTECA&x=39&y=10&filter_code_1=WLN&filter_request_1=&filter_code_2=WYR&filter_request_2=&filter_code_3=WYR&filter_request_3=" . trim($_POST['f_fecha']) . "&filter_code_4=WFM&filter_request_4=BK&filter_code_5=WSL&filter_request_5";
        }
        $temp      = file_get_contents($url);
        $total_str = entre($temp, 'Total:', '</tr>');
        $total_int = trim(strip_tags(html_entity_decode($total_str)), "\xa0\t\n\r\0\x0B ");
        if ($total_int == "0") {
            bibmsg('No se han encontrado resultados que cumplan todas las condiciones de búsqueda en la Biblioteca Nacional de Chile.', 'er', '', 'GET', '', 'no');
            $no_se_encuentra = "si";
        } else {
            $set_number = entre($total_str, 'set_number=', '>');
            if ($total_int > 1) {
                $no_se_encuentra = "si";
                $urlget          = "http://www.bncatalogo.cl/F" . $bnmses . "?func=full-set-set&set_number=" . $set_number . "&format=001&set_entry=";
                $alea            = randomtext(5);
                $_SESSION[$alea] = $urlget;
                $url2            = "http://www.bncatalogo.cl/F" . $bnmses . "?func=short-0&set_number=" . $set_number;
                $temp            = utf8_decode(file_get_contents($url2));
                $temp            = entre($temp, '<!-- filename: short-a-body-->', '<!-- filename: short-a-tail -->');
                echo "<div class=\"box-gre\"><div class=\"box-gre-cab\">Atención:</div><p>Se han encontrado " . $total_int . " resultados:</p><ul class=\"lista\">";
                while (strpos($temp, '<tr valign=baseline>') > -1 && strpos($temp, '</tr>') > -1) {
                    $contenido = entre($temp, '<tr valign=baseline>', '</tr>');
                    $auty      = trim(entre($contenido, 'width="20%" valign=top>', '</td>'));
                    preg_match('@^(.*?)(?:,[0-9-]+|$)@', $auty, $coi);
                    if (empty($coi[1]) == false) {
                        $auty = $coi[1];
                    }
                    $tituloar = trim(str_replace(array(
                        '/',
                        ' :'
                    ), array(
                        '',
                        ''
                    ), entre($contenido, 'width="40%" valign=top>', '</td>')));
                    $fechaar  = trim(entre($contenido, 'width="5%" valign=top>', '</td>'));
                    $entrada  = trim(entre($contenido, 'set_entry=', '&format='));
                    if ($auty <> '' && $auty <> "<BR>") {
                        $auty = "<span class=\"versalitas\">" . $auty . "</span>: ";
                    } else {
                        $auty = "&nbsp;";
                    }
                    echo "<li><a href=\"index.php?seccion=bibliotecaficha&amp;accion=confirmaritem&amp;sesion=" . $sesion . "&amp;urlsel=" . $alea . "&amp;itemsel=" . $entrada . "&amp;pb=3\"><img src=\"css/seleccionar.gif\" alt=\"Seleccione este libro\" /></a>" . $auty . "<i>" . $tituloar . "</i> (" . $fechaar . ")</li>";
                    $temp = str_replace('<tr valign=baseline>' . $contenido . '</tr>', '', $temp);
                }
                echo "</ul><br /></div><br />";
            }
            if ($total_int == "1") {
                $url2        = "http://www.bncatalogo.cl/F" . $bnmses . "?func=full-set-set&set_number=" . $set_number . "&set_entry=000001&format=001";
                $temp        = file_get_contents($url2);
                $analizarbnm = "si";
            }
        }
    }
    if (isset($analizarbnm) && $analizarbnm == "si") {
        $contenido = utf8_decode(entre($temp, '<!-- filename: full-000-body -->', '<!-- filename: full-set-tail -->'));
        $lista     = explode('</tr>', $contenido);
        for ($k = 0; $k < count($lista); $k++) {
            $significante = substr(trim(strip_tags(izquierda($lista[$k], '<td class=td1>'))), 0, 3);
            $significado  = trim(strip_tags(derecha($lista[$k], '<td class=td1>')));
            if (empty($significante) == false && empty($significado) == false) {
                switch ($significante) {
                    case "SYS":
                        $codbn = "BNC" . $significado;
                        break;
                    case "020":
                        preg_match('@^\|a ([0-9-]*?)(?: \(.*)?$@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $isbn = $coi[1];
                        }
                        break;
                    case "100":
                        preg_match('@^\|a (.*?)(?:(,)? \||$)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $autor = $coi[1];
                            preg_match('@\|b (.*?)(?:(,)? \||$)@', $significado, $coi);
                            if (empty($coi[1]) == false) {
                                $autor .= " " . $coi[1];
                            }
                            preg_match('@\|c (.*?)(?:(,)? \||$)@', $significado, $coi);
                            if (empty($coi[1]) == false) {
                                $autor .= ", " . $coi[1];
                            }
                        }
                        break;
                    case "260":
                        preg_match('@^\|a (?:\[?)(.*?)(?:\]?)(?: ;)?(?:,)?(?: \:| \|)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $lugar = $coi[1];
                        }
                        preg_match_all('@\|b (?:\[)?(.*?)(?:\])?(?: \:| \||$)@', $significado, $coi);
                        foreach ($coi[1] as $variab) {
                            if (empty($variab) == false) {
                                if (empty($editorial) == false) {
                                    $editorial .= "; ";
                                }
                                @$editorial .= $variab;
                            }
                        }
                        if (substr(@$editorial, strlen(@$editorial) - 1, 1) == ",") {
                            $editorial = substr(@$editorial, 0, strlen(@$editorial) - 1);
                        }
                        if (substr(@$editorial, strlen(@$editorial) - 1, 1) == "]") {
                            $editorial = substr(@$editorial, 0, strlen(@$editorial) - 1);
                        }
                        preg_match('@^(?:.*?)\|c (?:\[?)(?:c)?([0-9]{4})(?:\]?)(?:.)?@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $fecha = $coi[1];
                        }
                        break;
                    case "300":
                        preg_match('@^\|a ([0-9]{1,6})(?: p\.)(?:.*?)(?: \|)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $paginas = $coi[1];
                        }
                        preg_match('@^(?:.*?)\|c ([0-9]*)(?: cm.)?@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $altura = $coi[1];
                        }
                        break;
                    case "245":
                        preg_match('@^\|a (.*?)(?: \:)?(?: \|| \/)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $titulo = str_replace(' ;', ';', $coi[1]);
                            preg_match('@\|b (.*?)(?: \:)?(?: \|| \/)@', $significado, $coi);
                            if (empty($coi[1]) == false) {
                                $titulo .= ": " . $coi[1];
                            }
                        }
                        break;
                    case "440":
                        preg_match('@^\|a (.*?)(?:;| \||$)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $coleccion = $coi[1];
                            preg_match('@^(?:.*?)\|v (.*)@', $significado, $coi);
                            if (empty($coi[1]) == false) {
                                $numero = rastrearcifras($coi[1]);
                            }
                        }
                        break;
                    case "250":
                        preg_match('@^\|a (.*)(?: \||$)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $edicion = $coi[1];
                        }
                        break;
                    case "500":
                        preg_match('@^\|a (.*)(?: \|)?@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            if (empty($nota) == false) {
                                $nota .= " ";
                            }
                            @$nota .= $coi[1];
                        }
                        break;
                    case "504":
                        preg_match('@^\|a (.*)(?: \|)?@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            if (empty($nota) == false) {
                                $nota .= " ";
                            }
                            @$nota .= $coi[1];
                        }
                        break;
                    case "650":
                        preg_match('@^\|a (.*?)(?: \||$)@', $significado, $coi);
                        if (empty($coi[1]) == false && $coi[1] <> @$materias) {
                            if (empty($materias) == false) {
                                $materias .= "|OC|";
                            }
                            @$materias .= $coi[1];
                        }
                        break;
                    case "700":
                        preg_match('@^\|a (.*?)(?:(,|.)? \||$)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            if (empty($editor) == false) {
                                $editor .= "; ";
                            }
                            @$editor .= $coi[1];
                        }
                        break;
                    case "240":
                        preg_match('@^\|a (?:\[)?(.*?)(?:\])?(?:(.)? \||$)@', $significado, $coi);
                        if (empty($coi[1]) == false) {
                            $titulooriginal = $coi[1];
                            preg_match('@\|l (.*?)(?:\])?(?:(.)? \||$)@', $significado, $coi);
                            if (empty($coi[1]) == false) {
                                $idioma = $coi[1];
                            }
                        }
                        break;
                }
            }
        }
        if (empty($isbn) == false) {
            switch (isbn_tipo($isbn)) {
                case 1:
                    if (chequear_ean13($isbn) == false) {
                        bibmsg('Puede haber un problema con el ISBN obtenido tras la búsqueda: el dígito de control es incorrecto.', 'er', '', 'GET', '', 'no');
                    }
                    $isbn = substr($isbn, 0, 3) . "-" . isbn10_guiones(substr($isbn, 3, 10));
                    break;
                case 2:
                    if (dctrl_isbn10($isbn) <> $isbn[9]) {
                        bibmsg('Puede haber un problema con el ISBN obtenido tras la búsqueda: el dígito de control es incorrecto.', 'er', '', 'GET', '', 'no');
                    }
                    break;
                case 3:
                    if (chequear_ean13(substr('-', '', $isbn)) == false) {
                        bibmsg('Puede haber un problema con el ISBN obtenido tras la búsqueda: el dígito de control es incorrecto.', 'er', '', 'GET', '', 'no');
                    }
                    break;
                case 4:
                    if (dctrl_isbn10($isbn) <> $isbn[9]) {
                        bibmsg('Puede haber un problema con el ISBN obtenido tras la búsqueda: el dígito de control es incorrecto.', 'er', '', 'GET', '', 'no');
                    }
                    $isbn = isbn10_guiones($isbn);
                    break;
                case 0:
                    $isbn = "";
                    break;
            }
        }
        $titulodos = eliminararticulos($titulo);
        $signatura = crear_signatura($titulodos, @$autor, @$editor, $_SESSION['letra']);
    }
}
