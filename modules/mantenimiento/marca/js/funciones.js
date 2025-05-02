import { validarFormulario, cargarGrillaMantenimiento, agregarRegistro, modificarRegistro, eliminarRegistro, obtenerRegistro } from '/pizzeria/assets/js/funciones.js';

// Configuración de la grilla
export const actualizarGrilla = () => {
    $(document).ready(function () {
        const columnasDB = ['id_marca', 'nombre'];
        const columnasMostrar = [
            { name: 'id_marca', db: 'id_marca', searchable: true, visible: true },
            { name: 'nombre', db: 'nombre', searchable: true, visible: true }
        ];
        const join = '';
        cargarGrillaMantenimiento('marca-grid', 'marca', columnasDB, columnasMostrar, join);
    });
};


export const abrirModalEliminar = async () => {
    const id = obtenerIdFilaSeleccionada();

    if (!id) {
        mostrarMensajeAdvertencia("Debe seleccionar una fila antes de eliminar.");
        return;
    }

    const datos = await obtenerDatos(id);

    if (datos) {
        cargarDatosEnModalEliminar(datos);
        abrirModal('staticBackdropEliminar');
    }
};

export const abrirModalModificar = async () => {
    const id = obtenerIdFilaSeleccionada();

    if (!id) {
        mostrarMensajeAdvertencia("Debe seleccionar una fila antes de modificar.");
        return;
    }

    const datos = await obtenerDatos(id);

    if (datos) {
        cargarDatosEnModalModificar(datos);
        abrirModal('staticBackdropModificar');
    }
};

export const agregar = async () => {
    const formId = 'formAgregar';

    // Validar el formulario con Bootstrap
    if (!validarFormulario(formId)) {
        return; // Detener si el formulario no es válido
    }

    const nombreMarca = document.getElementById('nombreMarcaAgregar').value.trim();
    const tabla = 'marca';
    const campos = ['nombre'];
    const valores = [nombreMarca];

    const resultado = await agregarRegistro(tabla, campos, valores);

    if (resultado.operacion === "true") {
        mostrarMensajeExito("Marca registrada correctamente");
        cerrarModal('staticBackdropAgregar');
        limpiarFormulario(formId);
        actualizarGrilla();
    } else {
        mostrarMensajeError(resultado.mensaje || "Error al registrar la marca");
    }
};


//modificar registro
export const modificar = async () => {
    const formId = 'formModificar';

    // Validar el formulario con Bootstrap
    if (!validarFormulario(formId)) {
        return; // Detener si el formulario no es válido
    }

    const id = obtenerIdFilaSeleccionada();

    if (!id) {
        mostrarMensajeError("No se pudo obtener el ID del registro a modificar.");
        return;
    }

    const nombreMarca = document.getElementById('nombreMarcaModificar').value.trim();
    const tabla = 'marca';
    const columnaId = 'id_marca';
    const campos = ['nombre'];
    const valores = [nombreMarca];

    const resultado = await modificarRegistro(tabla, columnaId, id, campos, valores);

    if (resultado.operacion === "true") {
        mostrarMensajeExito("Marca modificada correctamente");
        cerrarModal('staticBackdropModificar');
        actualizarGrilla();
    } else {
        mostrarMensajeError(resultado.mensaje || "Error al modificar la marca");
    }
};

// Eliminación de un registro
export const eliminar = async () => {
    const id = obtenerIdFilaSeleccionada();

    if (!id) {
        mostrarMensajeError("No se pudo obtener el ID del registro a eliminar.");
        return;
    }

    const tabla = 'marca';
    const columnaId = 'id_marca';

    const resultado = await eliminarRegistro(tabla, columnaId, id);

    if (resultado.operacion === "true") {
        mostrarMensajeExito("Marca eliminada correctamente");
        cerrarModal('staticBackdropEliminar');
        actualizarGrilla();
    } else {
        mostrarMensajeError(resultado.mensaje || "Error al eliminar la marca");
    }
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
    const tabla = $('#marca-grid').DataTable();
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

const abrirModal = (modalId) => {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
};

const cerrarModal = (modalId) => {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal.hide();
    
};

const limpiarFormulario = (formId) => {
    document.getElementById(formId).reset();
};

const cargarDatosEnModalEliminar = (datos) => {
    document.getElementById('nombreMarcaEliminar').value = datos.nombre;
};

const cargarDatosEnModalModificar = (datos) => {
    document.getElementById('nombreMarcaModificar').value = datos.nombre;
};











