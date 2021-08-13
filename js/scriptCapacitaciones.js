'use strict';
document.addEventListener("DOMContentLoaded", function() {


    const url = "http://web-unicen.herokuapp.com/api/groups/grupo9rauch/inscriptos/";
    let boton = document.querySelector("#btnAgregar");
    boton.addEventListener("click", validarform);
    boton.addEventListener("click", vaciarFormulario);
    boton.addEventListener("click", captchaAleatorio);
    let botonvaciar = document.querySelector("#vaciarTabla");
    botonvaciar.addEventListener("click", tablavacia);
    let botontriple = document.querySelector("#cargarVarios");
    botontriple.addEventListener("click", cargartres);
    let tabla = document.querySelector("#miTabla");
    let busqueda = document.querySelector("#miInput");
    busqueda.addEventListener("keyup", filtros);

    captchaAleatorio();
    mostrarinscripcion(); //Trae el json desde el servidor
    recargar();


    //recarga las inscripciones/modificaciones del servidor cada 3 seg
    function recargar() {
        setInterval(function() { mostrarinscripcion(); }, 5000);
    }

    // Funcion para generar un Captcha Aleatorio.
    function captchaAleatorio() {
        let alea = parseInt(Math.floor((Math.random() * 999) + 1));
        document.querySelector("#aleatorio").value = alea;
        aleatorio.innerHTML = alea;

    }

    //Carga los datos del inscripto --> OK devuelve los datos del input
    function cargardatos() {
        let nombre = document.querySelector("#nombreCliente").value;
        let apellido = document.querySelector("#apellidoCliente").value;
        let curso = parseInt(document.querySelector("#cursoCliente").value);
        let email = document.querySelector("#emailCliente").value;
        let objeto = {
            "nombre": nombre,
            "apellido": apellido,
            "curso": curso,
            "mail": email

        }
        return objeto;
    }

    // Función para validar el formulario y cargar la nueva inscripción
    function validarform() {
        let nuevo = cargardatos();
        if (validarcampos(nuevo)) {
            cargarinscripcion(nuevo);
            alert("Su inscripción a sido enviada correctamente");
        }
    }

    //función para validar campos del formulario
    function validarcampos(nuevo) {
        let alea = document.querySelector("#aleatorio").value;
        let captcha = parseInt(document.querySelector("#captcha").value);
        if ((nuevo.nombre === "") || (nuevo.apellido === "") || (nuevo.email === "") || (nuevo.curso === "")) {
            alert("Todos los campos son obligatorios");
            return false;
        } else if ((nuevo.curso != 1) && (nuevo.curso != 2) && (nuevo.curso != 3)) {
            alert("No es un curso válido");
            return false;
        } else if (parseInt(captcha) === parseInt(alea)) {
            return true;
        } else {
            alert("Ingrese nuevamente el código");
            return false;
        }

    }
    //función para cargar el objeto con la inscripción al servidor y a la tabla
    async function cargarinscripcion(obj) {
        let inscripto = {
            "thing": obj,
        };

        let nuevo = JSON.stringify(inscripto);
        let r = await fetch(url, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": nuevo
        });
        if (r.ok) {
            let json = await r.json();
            cargartabla(json);
        }
    }


    // función para crear las filas y columnas de la tabla y cargarlas con los datos del servidor
    function cargartabla(json) {

        let data = json.information;
        let tabla = document.querySelector("#miTabla");
        let fila = tabla.insertRow(-1); //inserta fila
        let col1 = fila.insertCell(0); //inserta la primer celda
        let col2 = fila.insertCell(1);
        let col3 = fila.insertCell(2);
        let col4 = fila.insertCell(3);
        let col5 = fila.insertCell(4);
        let col6 = fila.insertCell(5);
        let col7 = fila.insertCell(6);
        col1.innerHTML = data.thing.curso;
        col2.innerHTML = data.thing.nombre;
        col3.innerHTML = data.thing.apellido;
        col4.innerHTML = data.thing.mail;
        col5.innerHTML = data._id;
        col5.classList.add("oculto");
        col6.innerHTML = '<button class="editarFila">Editar</button>';
        col7.innerHTML = '<button class="borrarFila">Borrar</button>';
        asignarbotones();
        if (data.thing.curso === 1) {
            fila.classList.add("cursodestacado");
        }
    }

    //función para asignar las funciones eliminar y editar a los respectivos botones, según id
    function asignarbotones() {

        let botonborrar = document.querySelectorAll(".borrarFila");
        let botoneditar = document.querySelectorAll(".editarFila")
        for (let i = 0; i < botonborrar.length; i++) {
            let id = document.getElementById("miTabla").rows[i].cells[4].innerHTML;
            botonborrar[i].addEventListener("click", function() { eliminarfilaserver(id) });
        }
        for (let i = 0; i < botoneditar.length; i++) {
            let id = document.getElementById("miTabla").rows[i].cells[4].innerHTML;
            botoneditar[i].addEventListener("click", function() { editarfilaserver(id) });
            botoneditar[i].addEventListener("click", vaciarFormulario);
        }
    }

    //función para retorna la posición de la fila (tabla) en el servidor
    async function buscarposicion(id) {
        try {
            let respuesta = await fetch(url);
            if (respuesta.ok) {
                let json = await respuesta.json();
                let i = 0;

                while (json.inscriptos[i]._id != id) {
                    i++;
                }
                if (json.inscriptos[i]._id === id) {
                    return i;

                } else
                    return alert("elemento no encontrado");
            } else {
                alert("error de URL");
            }
        } catch (e) {
            alert("error de conexión");
        }

    }

    //funcion para eliminar el contenido de la fila (tabla) en el servidor
    async function eliminarfilaserver(id) {

        let tr = document.querySelectorAll(".filatabla");
        let tbody = document.querySelectorAll("tabla");
        let pos = await buscarposicion(id);
        try {
            let respuesta = await fetch(url);
            if (respuesta.ok) {
                let json = await respuesta.json();
                if (json.inscriptos[pos]._id == id) {
                    try {
                        await fetch(url + json.inscriptos[pos]._id, {
                            "method": "DELETE",
                        });

                        tbody.innerHTML = tabla;
                    } catch (e) {
                        tbody.innerHTML = e;
                    }
                }
            }
        } catch (e) {
            tbody.innerHTML = e;
        }
        tr.innerHTML = "";
        mostrarinscripcion();
    }

    //funcion para editar el contenido de la fila (tabla) en el servidor
    async function editarfilaserver(id) {
        let paraeditar = cargardatos();

        if (validarcampos(paraeditar)) {

            let inscripto = {
                "thing": paraeditar
            };
            let objnuevo=JSON.stringify(inscripto);
            try { 
                    await fetch(url + id, {
                        "method": "PUT",
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "body": objnuevo
                    });               
                mostrarinscripcion();
            } catch (e) {
                alert(e);
            }

        }
    }

    //funcion para cargar el contenido del servidor en la tabla
    async function mostrarinscripcion() {

        let tbody = document.querySelector("#miTabla");
        try {
            let tabla = "<table>";
            let r = await fetch(url);
            if (r.ok) {
                let json = await r.json();

                for (let i = 0; i < json.inscriptos.length; i++) {
                    let inscripto = json.inscriptos[i];

                    if (inscripto.thing.curso === 1) {

                        tabla = tabla + "<tr class='cursodestacado filatabla'>" + "<td>" + inscripto.thing.curso + "</td>" + "<td>" + inscripto.thing.nombre + "</td>" +
                            "<td>" + inscripto.thing.apellido + "</td>" + "<td>" + inscripto.thing.mail + "</td>" + "</td>" + "<td class='oculto'>" + inscripto._id + "</td>" + "<td>" + '<button class="editarFila">Editar</button>' + "</td>" + "<td>" + '<button class="borrarFila">Borrar</button>' + "</td>" + "</tr>";
                    } else {
                        tabla = tabla + "<tr class='filatabla'>" + "<td>" + inscripto.thing.curso + "</td>" + "<td>" + inscripto.thing.nombre + "</td>" +
                            "<td>" + inscripto.thing.apellido + "</td>" + "<td>" + inscripto.thing.mail + "</td>" + "<td class='oculto'>" + inscripto._id + "</td>" + "<td>" + '<button class="editarFila">Editar</button>' + "</td>" + "<td>" + '<button class="borrarFila">Borrar</button>' + "</td>" + "</tr>";
                    }

                }
                tbody.innerHTML = tabla;
                asignarbotones();
            }

        } catch (e) {
            tbody.innerHTML = e;

        }

    }


    // Funcion para cargar tres elementos fijos al servidor y a la tabla.
    function cargartres() {

        let inscripto = {
            "curso": parseInt(Math.floor((Math.random() * 3) + 1)),
            "nombre": "JOAQQQUUIINNNN",
            "apellido": "HANDDBALLLL",
            "mail": "marting@gmail.com",
        };
        cargarinscripcion(inscripto);
        inscripto = {
            "curso": parseInt(Math.floor((Math.random() * 3) + 1)),
            "nombre": "Elva",
            "apellido": "Kehler",
            "mail": "elva@gmail.com",
        };
        cargarinscripcion(inscripto);
        inscripto = {
            "curso": parseInt(Math.floor((Math.random() * 3) + 1)),
            "nombre": "Sergio",
            "apellido": "Yañez",
            "mail": "sergio@gmail.com",
        };
        cargarinscripcion(inscripto);

    }

    //Función para borrar los datos del servidor.
    async function borrarinscripcion() {
        let tbody = document.querySelector("#miTabla");
        try {
            let respuesta = await fetch(url);
            if (respuesta.ok) {
                let json = await respuesta.json();

                for (let i = 0; i < json.inscriptos.length; i++) {

                    try {
                        await fetch(url + json.inscriptos[i]._id, {
                            "method": "DELETE",
                        });
                        tbody.innerHTML = "";
                    } catch (e) {
                        tbody.innerHTML = "Fallo el borrado";
                    }
                }
            } else alert("error")
        } catch (e) {
            alert(e);
        }


    }


    // Función para vaciar el formulario 
    function vaciarFormulario() {
        document.getElementById("formulario").reset();
    }



    //Función para vaciar el contenido de la tabla 
    function tablavacia() {
        let Tabla = document.getElementById("miTabla");
        Tabla.innerHTML = "";
        borrarinscripcion();
    }


    // Función para filtrar la tabla
    function filtros() {
        //        console.log("Funcion filtros");
        let miInput, filtro, tabla, tr, td0, td1, td2, td3, i;
        miInput = document.getElementById("miInput");
        filtro = miInput.value.toLowerCase();
        tabla = document.getElementById("miTabla");
        tr = tabla.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td0 = tr[i].getElementsByTagName("td")[0];
            td1 = tr[i].getElementsByTagName("td")[1];
            td2 = tr[i].getElementsByTagName("td")[2];
            td3 = tr[i].getElementsByTagName("td")[3];
            if ((td0.innerHTML.toLowerCase().indexOf(filtro) > -1) || (td1.innerHTML.toLowerCase().indexOf(filtro) > -1) || (td2.innerHTML.toLowerCase().indexOf(filtro) > -1) || (td3.innerHTML.toLowerCase().indexOf(filtro) > -1)) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
})