import {cargarGrillaReporte, obtenerRegistro } from '/pizzeria/assets/js/funciones.js';

// Configuración de la grilla
export const actualizarGrilla = () => {
    $(document).ready(function () {
        const columnasDB = ['id_marca', 'nombre'];
        const columnasMostrar = [
            { name: 'id_marca', db: 'id_marca', searchable: true, visible: true },
            { name: 'nombre', db: 'nombre', searchable: true, visible: true }
        ];
        const join = '';
        cargarGrillaReporte('marca-reporte-grid', 'marca', columnasDB, columnasMostrar, join);
    });
};


// Obtención de datos de un registro con ID específico
export const obtenerDatos = async (id) => {
    const tabla = 'marca';
    const columnaId = 'id_marca';

    const resultado = await obtenerRegistro(tabla, columnaId, id);

    if (resultado.exito) {
        return resultado.data;
    } else {
        mostrarMensajeError(resultado.mensaje || "Error al obtener el registro");
        return null;
    }
};




// Utilidades
const obtenerIdFilaSeleccionada = () => {
    const tabla = $('#marca-reporte-grid').DataTable();
    const filaSeleccionada = tabla.row({ selected: true });

    if (!filaSeleccionada.any()) {
        return null;
    }

    const datosFila = filaSeleccionada.data();
    return datosFila.id_marca;
};

const mostrarMensajeExito = (mensaje) => {
    swal.fire({
        title: mensaje,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
    });
};

const mostrarMensajeError = (mensaje) => {
    swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Aceptar"
    });
};

const mostrarMensajeAdvertencia = (mensaje) => {
    swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Aceptar"
    });
};











