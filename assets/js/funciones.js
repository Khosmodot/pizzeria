// Funciones Generales de JavaScript para la aplicación de Pizzería

// Función para verificar si el usuario está logueado
export const verificarSesion = () => {
    const isLoggedIn = localStorage.getItem("usuariologueado"); // Obtener el estado de sesión del localStorage
    if (!isLoggedIn || isLoggedIn !== "1") { // Si no está logueado
        localStorage.setItem("mensajeSesionInvalida", "1"); // Guardamos la intención del mensaje para mostrarlo en el login
        window.location.href = "/pizzeria/index.html"; // Redirigir al inicio de sesión
    } else { // Si está logueado
        // Mostrar el contenido del body después de que se haya cargado el DOM
        document.addEventListener("DOMContentLoaded", () => { // Esperar a que el DOM esté completamente cargado
            document.body.style.display = "block"; // Mostrar el body
        });
    }
};

// Función para cerrar sesión
export const cerrarSesion = () => {
    // Limpiar datos de sesión
    localStorage.clear();
    sessionStorage.clear();

    // Redirigir al inicio de sesión
    location.href = "/pizzeria/index.html";
};

// Función modular para validar formularios con Bootstrap
export const validarFormulario = (formId) => {
    const form = document.getElementById(formId); // Obtener el formulario por su ID

    if (!form) { // Si el formulario no existe, mostrar un mensaje de error para depuración
        console.error(`Formulario con ID "${formId}" no encontrado.`); // Mostrar error en consola
        return false;
    }

    const inputs = form.querySelectorAll('input, select, textarea'); // Obtener todos los campos de entrada del formulario
    let isValid = true; // Variable para verificar si el formulario es válido
    let firstInvalidField = null; // Variable para almacenar el primer campo no válido para hacer focus

    inputs.forEach(input => { // Iterar sobre cada campo de entrada
        // Validar el campo
        if (!input.checkValidity()) {
            isValid = false;

            // Agregar clases de Bootstrap para mostrar el mensaje de error
            input.classList.add('is-invalid');

            // Guardar el primer campo no válido para hacer focus
            if (!firstInvalidField) {
                firstInvalidField = input;
            }
        } else {
            // Si es válido, eliminar las clases de error y agregar la clase de éxito
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }

        // Agregar evento para validar dinámicamente mientras el usuario escribe
        input.addEventListener('input', function () { 
            if (input.checkValidity()) {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            } else {
                input.classList.remove('is-valid');
                input.classList.add('is-invalid');
            }
        });
    });

    // Hacer focus en el primer campo no válido
    if (firstInvalidField) {
        firstInvalidField.focus();
    }

    // Agregar la clase de Bootstrap al formulario
    form.classList.add('was-validated');

    return isValid;
};

// Función modular para obtener el registro de la base de datos
export const obtenerRegistro = async (tabla, columnaId, valorId) => {
    try {
        const formData = new FormData(); // Crear un nuevo objeto FormData para enviar datos al servidor
        formData.append('accion', 'obtenerRegistro'); // Acción a realizar en el servidor
        formData.append('tabla', tabla);    // Nombre de la tabla en la base de datos
        formData.append('columnaId', columnaId); // Nombre de la columna que tiene el ID
        formData.append('valorId', valorId);   // Valor del ID a buscar

        const response = await fetch('/pizzeria/servicios/servicios.php', { // Realizar la petición al servidor
            method: 'POST', // Método de la petición
            body: formData // Datos a enviar al servidor
        });

        if (!response.ok) { // Verificar si la respuesta del servidor es correcta
            throw new Error('Error en la respuesta del servidor'); // Lanzar error si no es correcta
        }

        const resultado = await response.json();

        if (resultado.operacion === 'true') {
            return { exito: true, data: resultado.data };
        } else {
            return { exito: false, mensaje: resultado.mensaje || 'Error al obtener el registro' };
        }
    } catch (error) {
        console.error('Error en la petición Fetch:', error);
        return { exito: false, mensaje: 'Error en la petición Fetch' };
    }
};

// Función modular para obtener el ID de la fila seleccionada en DataTable
export const obtenerIdFilaSeleccionada = (tablaId, campoId) => {
    const tabla = $(`#${tablaId}`).DataTable();
    const filaSeleccionada = tabla.row({ selected: true });

    if (!filaSeleccionada.any()) {
        return null;
    }

    const datosFila = filaSeleccionada.data();
    return datosFila[campoId];
};

// funcion modular para agregar registro
export const agregarRegistro = async (tabla, campos, valores) => {
    try {
        const formData = new FormData();
        formData.append('accion', 'insertar');
        formData.append('tabla', tabla);
        formData.append('campos', campos.join(','));
        formData.append('valores', valores.join(','));

        const response = await fetch('/pizzeria/servicios/servicios.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();
        console.log('Resultado de la inserción:', resultado);
        return resultado;

    } catch (error) {
        console.error("Error al insertar registro:", error);
        return { operacion: "false", mensaje: "Error de red o servidor." };
    }
};

// funcion modular para modificar registro
export const modificarRegistro = async (tabla, columnaId, valorId, campos, valores) => {
    try {
        const formData = new FormData();
        formData.append('accion', 'modificar');
        formData.append('tabla', tabla);
        formData.append('columnaId', columnaId);
        formData.append('valorId', valorId);
        formData.append('campos', campos.join(','));
        formData.append('valores', valores.join(','));

        const response = await fetch('/pizzeria/servicios/servicios.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();
        console.log('Resultado de la modificación:', resultado);
        return resultado;

    } catch (error) {
        console.error("Error al modificar registro:", error);
        return { operacion: "false", mensaje: "Error de red o servidor." };
    }
};

// funcion modular para eliminar registro
export const eliminarRegistro = async (tabla, columnaId, valorId) => {
    try {
        const formData = new FormData();
        formData.append('accion', 'eliminar');
        formData.append('tabla', tabla);
        formData.append('columnaId', columnaId);
        formData.append('valorId', valorId);

        const response = await fetch('/pizzeria/servicios/servicios.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();
        console.log('Resultado de la eliminación:', resultado);
        return resultado;

    } catch (error) {
        console.error("Error al eliminar registro:", error);
        return { operacion: "false", mensaje: "Error de red o servidor." };
    }
};

// funcion modular para cargar grilla de datatables
export const cargarGrillaMantenimiento = (idTablaHtml, tablaBD, columnasDB, columnasMostrar, join = '') => {
    if ($.fn.DataTable.isDataTable(`#${idTablaHtml}`)) {
        $(`#${idTablaHtml}`).DataTable().destroy();
    }

    var dataTable = $(`#${idTablaHtml}`).DataTable({

        select: {
            style: 'single', // Seleccion única
            info: false // Desactiva el mensaje de selección
        },
        // select: true,
        lengthChange: false, // Desactiva el selector de cantidad de filas



        language: {
            url: "/pizzeria/assets/json/datatables_es.json"
        },
        processing: true, // Muestra el indicador de carga
        serverSide: true, // Habilita el procesamiento del lado del servidor
        ajax: {
            url: "/pizzeria/servicios/servicios.php?accion=cargarGrilla",
            type: "POST", 
            data: function (d) {
                d.tabla = tablaBD;
                d.columnasDB = JSON.stringify(columnasDB);
                d.columnasMostrar = JSON.stringify(columnasMostrar);
                d.join = join;
            },
            dataSrc: function (json) {
                console.log(json); // Verifica la respuesta del servidor
                return json.data;
            },
            error: function (xhr, error, thrown) {
                console.error("Error en AJAX:", xhr.responseText);
            }
        },
        columns: columnasMostrar.map(col => ({
            data: col.db,
            // name: col.name,
            searchable: col.searchable === true,
            visible: col.visible !== false
        })),
        // Añade esta configuración para alinear las columnas
        columnDefs: [
            {
                // Alinea TODAS las columnas a la izquierda (por defecto)
                targets: '_all',
                className: 'text-left dt-body-left dt-head-left',
                // type: 'string' // Fuerza el tipo a string para todas las columnas
            }


        ],
        // autoType: false, // Desactiva la detección automática de tipos
        responsive: true,
        fnDrawCallback: function () {
            $('[data-toggle="tooltip"]').tooltip({
                container: 'body',
                html: true,
                animation: true,
                placement: "top"
            });
        }
    });


    $(`#${idTablaHtml}`).on('select.dt', function (e, dt, type, indexes) {
        if (type === 'row') {
            var data = dt.row(indexes).data();
            console.log('Fila seleccionada:', data);
        }
    });

    return dataTable;
};

// Función modular para abrir un modal de Bootstrap
export const abrirModal = (modalId) => {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
};

// Función modular para cerrar un modal de Bootstrap
export const cerrarModal = (modalId) => {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal.hide();
};

// Función modular para limpiar un formulario
export const limpiarFormulario = (formId) => {
    document.getElementById(formId).reset();
};

// Funciones modulares para mostrar mensajes de éxito, error y advertencia con SweetAlert2
export const mostrarMensajeExito = (mensaje) => {
    swal.fire({
        title: mensaje,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
    });
};

export const mostrarMensajeError = (mensaje) => {
    swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Aceptar"
    });
};

export const mostrarMensajeAdvertencia = (mensaje) => {
    swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Aceptar"
    });
};