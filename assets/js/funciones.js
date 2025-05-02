
export const verificarSesion = () => {
    const isLoggedIn = localStorage.getItem("usuariologueado");
    if (!isLoggedIn || isLoggedIn !== "1") {
        localStorage.setItem("mensajeSesionInvalida", "1"); // Guardamos la intención del mensaje
        window.location.href = "/pizzeria/index.html";
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            document.body.style.display = "block";
        });
    }
};


export const cerrarSesion = () => {
    // Limpiar datos de sesión
    localStorage.clear();
    sessionStorage.clear();

    // Redirigir al inicio de sesión
    location.href = "/pizzeria/index.html";
};



export const validarFormulario = (formId) => {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Formulario con ID "${formId}" no encontrado.`);
        return false;
    }

    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    let firstInvalidField = null;

    inputs.forEach(input => {
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
            // Si es válido, eliminar las clases de error
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


export const obtenerRegistro = async (tabla, columnaId, valorId) => {
    try {
        const formData = new FormData();
        formData.append('accion', 'obtenerRegistro');
        formData.append('tabla', tabla);
        formData.append('columnaId', columnaId);
        formData.append('valorId', valorId);

        const response = await fetch('/pizzeria/servicios/servicios.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
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
            url: "/pizzeria/assets/js/datatables_es.json"
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

