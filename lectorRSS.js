// Este script ha sido probado en Google Chrome e Internet Explorer 11.

// Esta función se ejecutará una vez cargada la página.
function inicio()
{
    // Hacemos la carga inicial de las fuentes RSS.
    obtenerFuentesRSS();
    
    // Asociamos una funcion que cargará el RSS seleccionado al evento change del elemento select.
    crearEvento(document.getElementById('campoSelect'), 'change', mostrarRSSSeleccionado);
    
    // Agregamos los eventos de los distintos botones.
    crearEvento(document.getElementById('anterior'), 'click', mostrarAnteriorRSS);
    crearEvento(document.getElementById('siguiente'), 'click', mostrarSiguienteRSS);
    crearEvento(document.getElementById('crearRSS'), 'click', agregarFuenteRSS);
    crearEvento(document.getElementById('borrarRSS'), 'click', eliminarFuenteRSS);
}

// Función que obtendrá el listado de fuentes RSS.
function obtenerFuentesRSS()
{
    // Usamos la función cross-browser contenida en "funciones.js" para obtener una instancia de XMLHttpRequest.
    var xhr = objetoXHR();

    // Mostramos el indicador de la esquina superior derecha.
    activarIndicadorAjax();

    // Preparamos la llamada AJAX.
    xhr.open('GET', 'rss.php?accion=recursosRSS', true);

    // Establecemos una función como "callback" para procesar los estados de la respuesta.
    xhr.onreadystatechange = peticionObtenerFuentesRSS;
    
    // Ejecutamos la llamada.
    xhr.send(null);
}

// Función callback para procesar la llamada al servicio de obtención de las fuentes RSS.
function peticionObtenerFuentesRSS()
{
    // Cuando la respuesta está en el estado correcto y obtnemos un código HTTP 200
    if (this.readyState == 4 && this.status == 200)
    {
        // Cuando no existen fuentes RSS en base de datos, el web service devuelve la cadena "null", cosa que comprobamos aquí.
        if(this.responseText == "null")
        {
            mostarAvisoNingunRSS();
			
			// En caso de que no existan fuentes RSS, debemos vaciar el selector. Para ello, primero localizamos el elemento "select".
			nodo_select = document.getElementById('campoSelect');
			
			// Y a continuación borramos todos sus elementos hijos.
			while (nodo_select.firstChild)
			{
				nodo_select.removeChild(nodo_select.firstChild);        
			}
        }
        else
        {
            // Usamos eval para tratar como variable JavaScript el JSON que traemos del web service y asignamos el nuevo objeto a una variable global.
            listado_fuentes_RSS = eval('(' + this.responseText + ')');

            // Ejecutamos esta función para rellenar el selector con la lista obtenida.
            rellenarSelect();

            // Con esta función haremos la precarga del contenido de las fuentes RSS.
            cargarFuentesRSS();    
        }
    }
}

// Función que permite rellenar el elemento select con el listado guardado en la variable global "listado_fuentes_RSS".
function rellenarSelect()
{
    // Inicializamos las variables, vaciándolas en caso de que hayan sido usadas previamente.
    // Aprovechamos, aunque quizás no sea el lugar más adecuado, para crear un array que contendrá los IDs de los RSSs cargados, para facilitar el poder después recorrerlos y determinar cuál es el primero y el último.
    contenido_select = [];
    indices_listado_fuentes_RSS = [];
    
    // Localizamos el elemento mediante las funciones del DOM.
    nodo_select = document.getElementById('campoSelect');
    
    // Borramos el contenido del select.
    while (nodo_select.firstChild)
    {
        nodo_select.removeChild(nodo_select.firstChild);        
    }

    // Recorremos el listado de fuentes.
    for(var index in listado_fuentes_RSS) 
    {
        // Agregamos el identificador del elemento actual a nuestro array de indices.
        indices_listado_fuentes_RSS.push(parseInt(index));
        
        // Usamos las funciones del DOM para construir los elementos "option" que después agregaremos al elemento "select".
        elemento_nueva_opcion = document.createElement('option');
        elemento_nueva_opcion.setAttribute('value', listado_fuentes_RSS[index].id);
        nodo_texto = document.createTextNode(listado_fuentes_RSS[index].titulo);
        elemento_nueva_opcion.appendChild(nodo_texto);
        nodo_select.appendChild(elemento_nueva_opcion);
    }
}

// Esta función se encargará de realizar la precarga de todos las fuentes RSS existentes en la base de datos.
function cargarFuentesRSS()
{
    // Iniciaizamos dos variables que nos permitirán saber cuándo ha finalizado del todo la precarga.
    // Esto es necesario debido a que las conexiones son asíncronas. No nos serviría actuar cuando el elemento con el identificador más alto se haya cargado debido a que, por el carácter asíncrono de la conexión, la carga de una fuente RSS con un ID más bajo puede terminar más tarde.
    numero_fuentes = 0;
    fuentes_cargadas = 0;
    
    // Dejamos vacía la variable que albergara el contenido precargado.
    contenido_fuentes_RSS = [];
    
    // Recorremos la lista de fuentes RSS y vamos precargando una a una.
    for(var index in listado_fuentes_RSS) 
    {
        // Cargamos esta fuente.
        cargarFuenteRSS(listado_fuentes_RSS[index].id);
        
        // Incrementamos el contador de número de fuentes cargadas.
        numero_fuentes++;
    }
}

// Esta función se encargará de hacer la precarga de una fuente determinada.
function cargarFuenteRSS(identificador_fuente)
{
    var xhr = objetoXHR();
    
    // Hacemos la llamada para obtner el contenido de la fuente.
    xhr.open('GET', 'rss.php?accion=cargar&id=' + identificador_fuente, true);

    // En este caso recurrimos a esta forma de indicar el callback que nos permitirá pasar una variable.
    // Debemos pasar también el objeto XHR para poder consultar el estado de la respuesta y la respuesta misma.
    xhr.onreadystatechange = function() {peticioncargarFuenteRSS(xhr, identificador_fuente);};
    
    xhr.send(null);
}

// Esta es la función callback que comprobará el estado de la conexión para actuar cuando haya finalizado correctamente.
function peticioncargarFuenteRSS(xhr, identificador_fuente)
{   
    if (xhr.readyState == 4 && xhr.status == 200)
    {
        var contenido_fuente_RSS = eval('(' + xhr.responseText + ')');
        
        // Añadimos al array "contenido_fuentes_RSS" un objeto con el id de la fuente y su contenido, que a su vez es un array de objetos.
        contenido_fuentes_RSS.push({id: identificador_fuente, contenido: contenido_fuente_RSS});
        
        // Incrementamos el contador de fuentes cargadas.
        fuentes_cargadas++;
        
        // Si el número de fuentes cargadas coincide ya con el de fuentes existentes, mostramos la primera fuente RSS de la lista y desactivamos el contador.
        // Antes se ha explicado que esta comprobación es necesaria debido al carácter asíncrono de las conexiones.
        if(fuentes_cargadas == numero_fuentes)
        {
            mostrarRSSSeleccionado();
            desactivarIndicadorAjax();
        }
    }
}

// Disponemos de esta función que nos permite mostrar un aviso en lugar del contenido del RSS cuando sea necesario (por ejemplo, cuando no haya ninguna fuente RSS configurada.
function mostarAvisoNingunRSS()
{
     $('#noticias').html("No hay ningún RSS que mostrar.");
}

// Esta función nos permite mostrar el contenido de la fuente RSS seleccionada.
function mostrarRSSSeleccionado()
{
    // Localizamos mendiante las funciones del DOM el elemento "select".
    var identificador_rss_seleccionado = document.getElementById('campoSelect').value;
    
    // Si hay un valor seleccionado, mostramos el contenido de la fuente RSS mediante la función "mostrarRSS".
    if(identificador_rss_seleccionado != undefined && identificador_rss_seleccionado != "")
    {
        mostrarRSS(identificador_rss_seleccionado);   
    }
    else
    {
        mostarAvisoNingunRSS();
    }
}

// Esta funcion nos permite mostrar el contenido de la fuente RSS el el lugar reservado para ello.
function mostrarRSS(identificador_rss)
{
    // Recorremos el array donde hemos precargado el contenido de las fuentes RSS.
    for(n=0; n<contenido_fuentes_RSS.length; n++)
    {
        // Si el id de la fuente RSS actual coincide con la que hemos recibido como parámetro de la función, procedemos a mostrarla.
        if(contenido_fuentes_RSS[n].id == identificador_rss)
        {
            // Guardamos cuál es la fuente RSS cargada actualmente, lo que nos permitirá navegar adelante y atrás entre las fuentes.
            identificador_rss_actual = identificador_rss;
            
            var titulo_rss = "";
            var nuevo_contenido = "";
            
            // Recorremos el listado de fuentes RSS para recuperar el nombre de la fuente.
            for(var index in listado_fuentes_RSS) 
            {
                if(listado_fuentes_RSS[index].id == identificador_rss)
                {
                    titulo_rss = listado_fuentes_RSS[index].titulo;
                }
            }
            
            // Usamos un selector de jQuery para localizar el título del lector RSS.
            $('#titulo').html('Lector de Titulares RSS con AJAX y jQuery >>> Fuente RSS: ' + titulo_rss);
            
            // Introducimos la cabecera de la información que se mostrara de la fuente RSS.
            nuevo_contenido += "<h1><b>Fuente RSS: " + titulo_rss + "</b></h1>";
            
            // Recorremos los elementos, los "items", de la fuente RSS, que van almacenados dentro de la propiedad contenido de la variable donde tenemos precargados todas las fuentes RSS.
            for(m=0; m<contenido_fuentes_RSS[n].contenido.length; m++)
            {
                // Para cada "item", agregamos el tiular, el texto de descripción (que puede incluir incluso imágenes), y una línea de separación.
                nuevo_contenido += "<h3><b>" + contenido_fuentes_RSS[n].contenido[m].titulo + '</b></h3>';
                nuevo_contenido += contenido_fuentes_RSS[n].contenido[m].descripcion + "<br/><br/>";
                nuevo_contenido += "<hr>";
            }
            
            // Si se trata de la primera carga, vamos a hacer que el efecto de difuminado inicial (fade out) sea más rapido.
            if(primera_carga)
            {
                var tiempo_fade_out = 10;
            
                primera_carga = false;
            }
            else
            {
                var tiempo_fade_out = 300;
            }
            
            // Usamos jQuery para encadenar una serie de acciones sobre el elemento con id "noticias".
            // Primero hacemos desaparecer el contenido con un efecto de difuminado.
            // Depués introducimos el nuevo contenido mediante el método "html".
            // Finalmente hacemos aparecer el contenido con un efecto similar.
            $('#noticias').fadeOut(tiempo_fade_out, function(){
                $('#noticias').html(nuevo_contenido);
                $('#noticias').fadeIn(600);
            });
            
            break;
        }
    }
}

// Esta funcion nos permitira "navegar" al siguiente elemento del listado de fuentes RSS.
function mostrarSiguienteRSS()
{   
    // Usamos Math.max.apply para obtener el número más alto dentro de nuestro listado de índices.
    // Si el listado esta vacío, o si él elemento actual ya es el de indice mayor, solo mostramos una alerta.
    if(indices_listado_fuentes_RSS.length == 0 || identificador_rss_actual == Math.max.apply(Math, indices_listado_fuentes_RSS))
    {
        alert("No hay más fuentes RSS que mostrar.");
    }
    else
    {
        // Recorremos el listado de índices hasta encontrar el actual.
        for(n=0; n<indices_listado_fuentes_RSS.length; n++)
        {
            if(indices_listado_fuentes_RSS[n] == identificador_rss_actual)
            {
                // Obtenemos el indice (identificador) de la fuente RSS siguiente a la actual (siguiente elemento del array del listado de índices).
                nuevo_indice = indices_listado_fuentes_RSS[n+1];
                break;
            }
        }
        
        // Hacemos que en el "select" cambie el valor seleccionado en consecuencia.
        $('#campoSelect').val(nuevo_indice);
        
        // Ejecutamos la función que carga la fuente RSS de memoria.
        mostrarRSS(nuevo_indice);
    }
}

function mostrarAnteriorRSS()
{   
    // Usamos Math.min.apply para obtener el número más alto dentro de nuestro listado de índices.
    // Si el listado esta vacío, o si él elemento actual ya es el de indice menor, solo mostramos una alerta.
    if(indices_listado_fuentes_RSS.length == 0 || identificador_rss_actual == Math.min.apply(Math, indices_listado_fuentes_RSS))
    {
        alert("No hay una fuente RSS anterior que mostrar.")
    }
    else
    {
        // Recorremos el listado de índices hasta encontrar el actual.
        for(n=0; n<indices_listado_fuentes_RSS.length; n++)
        {
            if(indices_listado_fuentes_RSS[n] == identificador_rss_actual)
            {
                // Obtenemos el indice (identificador) de la fuente RSS siguiente a la actual (siguiente elemento del array del listado de índices).
                nuevo_indice = indices_listado_fuentes_RSS[n-1];
                break;
            }
        }
        
        // Hacemos que en el "select" cambie el valor seleccionado en consecuencia.
        $('#campoSelect').val(String(nuevo_indice));
        
        // Ejecutamos la función que carga la fuente RSS de memoria.
        mostrarRSS(String(nuevo_indice));
    }
}

// Función que nos permite añadir una nueva fuente RSS.
function agregarFuenteRSS()
{
    // Preguntamos al usuario por el nombre que quiere asociar con la fuente RSS.
    var titulo_nuevo_rss = window.prompt('Introduzca un título para el nuevo RSS.', '');
    if(titulo_nuevo_rss != null && titulo_nuevo_rss != "")
    {
        // Preguntamos al usuario por la dirección de la fuente RSS.
        var direccion_nuevo_rss = window.prompt('Introduzca la dirección (URL) del nuevo RSS.', '');
        
        if(direccion_nuevo_rss != null && direccion_nuevo_rss != "")
        {
            // Mostramos el gráfico de carga.
            activarIndicadorAjax();
            
            var xhr = objetoXHR();

			// Preparamos la llamada para crear la nueva fuente RSS.
			// Usamos encodeURIComponent para evitar problemas al incluir otra dirección en la solicitud GET al servidor.
            xhr.open('GET', 'rss.php?accion=nueva&titulo=' + titulo_nuevo_rss + '&url=' + encodeURIComponent(direccion_nuevo_rss), true);

			// Asociamos la función callback "peticionAgregarFuenteRSS" para que maneje el estado de la respuesta recibida del servidor.
            xhr.onreadystatechange = peticionAgregarFuenteRSS;

            xhr.send(null);
        }
        else if(direccion_nuevo_rss == "")
        {
			// En caso de que la dirección esté vacía, se muestra un error.
            alert("Debe introducir una dirección para el nuevo RSS.")
        }
    }
    else if(titulo_nuevo_rss == "")
    {
		// En caso de que el título esté vacío, se muestra un error.
        alert("Debe introducir un título.")
    }
}

// Esta es la función callback que permitirá controlar las acciones a tomar en función de la respuesta del servidor.
function peticionAgregarFuenteRSS()
{
    if (this.readyState == 4 && this.status == 200)
    {   
		// La respuesta es el ID del registro introducido en la base de datos. En caso de error, el servidor enviará un texto con el mensaje del mismo. Por lo tanto debemos comprobar si la respuesta contiene texto o es un número válido.
        if(isNaN(this.responseText))
        {
            alert("Ha ocurrido un error al agregar la fuente RSS.");
        }
        else
        {
			// En caso de que la respuesta sea positiva, forzamos la recarga de toda la información desde el web service.
            obtenerFuentesRSS();
            alert("Fuente RSS agregada correctamente.");
        }
        
		// Ocultamos el indicador.
        desactivarIndicadorAjax();
    }
}

// Esta función nos permitirá eliminar la fuente RSS seleccionada.
function eliminarFuenteRSS()
{
	// Abrimos un diálogo de confirmación al usuario.
    confirmacion_eliminar = window.confirm('¿Está seguro de que desea eliminar la fuente RSS seleccionada?');
    
    if(confirmacion_eliminar == true)
    {
		// Localizamos el elemento "select" mediante las funciones del DOM.
        var identificador_rss_seleccionado = document.getElementById('campoSelect').value;

		// Comprobamos que haya un valor seleccionado.
        if(identificador_rss_seleccionado != undefined && identificador_rss_seleccionado != "")
        {
			// Mostramos el indicador.
            activarIndicadorAjax();

            var xhr = objetoXHR();

			// Preparamos la llamada al servidor para realizar el borrado.
            xhr.open('GET', 'rss.php?accion=borrar&id=' + identificador_rss_seleccionado);

            xhr.onreadystatechange = peticionEliminarFuenteRSS;

            xhr.send(null);
        }
        else
        {
			// Esta alerta solo se mostrará en el caso de que el usuario pulse en "Eliminar RSS" cuando no haya ningún elemento en el selector.
            alert("No ha seleccionado una fuente RSS.");
        }
    }
}

// Esta es la función callback que permite tratar la respuesta del servidor.
function peticionEliminarFuenteRSS()
{
    if (this.readyState == 4 && this.status == 200)
    {   
		// En este caso, el servidor enviará "OK" si todo ha ido correctamente.
        if(this.responseText == "OK")
        {
			// En caso de borrarse correctamente, forzamos la carga de todos los datos.
            obtenerFuentesRSS();
            alert("La fuente RSS se ha eliminado correctamente.");
        }
        else
        {
            alert("Ha ocurrido un error al tratar de eliminar la fuente RSS.");
        }
        
        desactivarIndicadorAjax();
    }
}

// Ejecutamos la función "inicio" cuando la carga de la página haya finalizado.
crearEvento(window, 'load', inicio);

// Inicializamos variables globales.
var listado_fuentes_RSS = [];
var indices_listado_fuentes_RSS = [];
var contenido_fuentes_RSS = [];
var numero_fuentes = 0;
var fuentes_cargadas = 0;
var identificador_rss_actual = 0;
var primera_carga = true;
