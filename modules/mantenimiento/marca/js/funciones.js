import { validarFormulario,
    cargarGrillaMantenimiento,
    agregarRegistro,
    modificarRegistro,
    eliminarRegistro,
    obtenerRegistro,
    obtenerIdFilaSeleccionada,
    abrirModal,
    cerrarModal,
    limpiarFormulario,
    mostrarMensajeExito,
    mostrarMensajeError,
    mostrarMensajeAdvertencia } from '/pizzeria/assets/js/funciones.js';

// Configuración específica de variables del módulo
const CONFIG_VAR = {
    tablaId: 'marca', // Nombre de la tabla en la base de datos
    columnaIdBD: 'id_marca', // Nombre de la columna que contiene el ID en la base de datos
    grillaId: 'marca-grid', // ID de la grilla en el HTML
    columnaIdGrilla: 'id_marca', // Nombre de la columna que contiene el ID en la grilla
};

// Configuración y carga/actualizacion de la grilla
export const actualizarGrilla = () => {
    $(document).ready(function () {
        // Configuración de columnas de la tabla de la base de datos
        const columnasDB = ['id_marca', 'nombre'];
        // Configuración de columnas a mostrar en la grilla
        const columnasMostrar = [
            { name: 'id_marca', db: 'id_marca', searchable: false, visible: false },
            { name: 'nombre', db: 'nombre', searchable: true, visible: true }
        ];
        // Configuración de join (si es necesario)
        const join = '';
        // Cargar la grilla de mantenimiento
        cargarGrillaMantenimiento(CONFIG_VAR.grillaId, CONFIG_VAR.tablaId, columnasDB, columnasMostrar, join);
    });
};

// Funcion para verificar y abrir el modal de eliminar
export const abrirModalEliminar = async () => {
    const id = obtenerIdFilaSeleccionada(CONFIG_VAR.grillaId, CONFIG_VAR.columnaIdGrilla); // Obtener el ID de la fila seleccionada
    // Si no hay fila seleccionada, mostrar mensaje de advertencia y detener la ejecución
    if (!id) {
        mostrarMensajeAdvertencia("Debe seleccionar una fila antes de eliminar.");
        return;
    }    

    const datos = await obtenerRegistro(CONFIG_VAR.tablaId, CONFIG_VAR.columnaIdBD, id);  //Obtener el registro de la base de datos por ID

    // Si la operación fue exitosa, cargar los datos en el modal de eliminar y abrir el modal
    if (datos.exito) {
        cargarDatosEnModalEliminar(datos.data);
        abrirModal('staticBackdropEliminar');
    } else { // Si hubo un error al obtener el registro, mostrar mensaje de error
        mostrarMensajeError(datos.mensaje || "Error al obtener el registro");
    }
};

// Funcion para verificar y abrir el modal de modificar
export const abrirModalModificar = async () => {
    const id = obtenerIdFilaSeleccionada(CONFIG_VAR.grillaId, CONFIG_VAR.columnaIdGrilla); // Obtener el ID de la fila seleccionada
    // Si no hay fila seleccionada, mostrar mensaje de advertencia y detener la ejecución
    if (!id) {
        mostrarMensajeAdvertencia("Debe seleccionar una fila antes de modificar.");
        return;
    }

    const datos = await obtenerRegistro(CONFIG_VAR.tablaId, CONFIG_VAR.columnaIdBD, id);  //Obtener el registro de la base de datos por ID

    // Si la operación fue exitosa, cargar los datos en el modal de modificar y abrir el modal
    if (datos.exito) {
        cargarDatosEnModalModificar(datos.data);
        abrirModal('staticBackdropModificar');
    } else { // Si hubo un error al obtener el registro, mostrar mensaje de error
        mostrarMensajeError(datos.mensaje || "Error al obtener el registro");
    }
};

// Agregar registro
export const agregar = async () => {
    const formId = 'formAgregar';   // ID del formulario de agregar

    // Validar el formulario con validaciones de Bootstrap
    if (!validarFormulario(formId)) {
        return; // Detener si el formulario no es válido
    }
    // Obtener los valorres de los campos y eliminar espacios en blanco
    const nombreMarca = document.getElementById('nombreMarcaAgregar').value.trim();
    // Campos de la tabla en la base de datos
    const campos = ['nombre']; 
    // Valores a insertar en la base de datos
    const valores = [nombreMarca];  

    const resultado = await agregarRegistro(CONFIG_VAR.tablaId, campos, valores); // Llamar a la función para agregar el registro a la base de datos
    // Si la operación fue exitosa, mostrar mensaje de éxito y cerrar el modal
    if (resultado.operacion === "true") {
        mostrarMensajeExito("Marca registrada correctamente");
        cerrarModal('staticBackdropAgregar');
        limpiarFormulario(formId);
        actualizarGrilla();
    } else { // Si hubo un error al agregar el registro, mostrar mensaje de error
        mostrarMensajeError(resultado.mensaje || "Error al registrar la marca");
    }
};

// Modificar registro
export const modificar = async () => {
    const formId = 'formModificar'; // ID del formulario de modificar

    // Validar el formulario con validaciones de Bootstrap
    if (!validarFormulario(formId)) {
        return; // Detener si el formulario no es válido
    }

    const id = obtenerIdFilaSeleccionada(CONFIG_VAR.grillaId, CONFIG_VAR.columnaIdGrilla); // Obtener el ID de la fila seleccionada

    if (!id) { // Si no hay fila seleccionada, mostrar mensaje de error y detener la ejecución
        mostrarMensajeError("No se pudo obtener el ID del registro a modificar.");
        return;
    }
    // Obtener los valores de los campos y eliminar espacios en blanco
    const nombreMarca = document.getElementById('nombreMarcaModificar').value.trim();
    
    const campos = ['nombre']; // Campos de la tabla en la base de datos
    const valores = [nombreMarca]; // Valores a modificar en la base de datos

    const resultado = await modificarRegistro(CONFIG_VAR.tablaId, CONFIG_VAR.columnaIdBD, id, campos, valores);

    if (resultado.operacion === "true") { // Si la operación fue exitosa, mostrar mensaje de éxito y cerrar el modal
        mostrarMensajeExito("Marca modificada correctamente");
        cerrarModal('staticBackdropModificar');
        actualizarGrilla();
    } else { // Si hubo un error al modificar el registro, mostrar mensaje de error
        mostrarMensajeError(resultado.mensaje || "Error al modificar la marca");
    }
};

// Eliminar registro
export const eliminar = async () => {
    const id = obtenerIdFilaSeleccionada(CONFIG_VAR.grillaId, CONFIG_VAR.columnaIdGrilla); // Obtener el ID de la fila seleccionada

    if (!id) { // Si no se encontró el ID, mostrar mensaje de error y detener la ejecución
        mostrarMensajeError("No se pudo obtener el ID del registro a eliminar.");
        return;
    }

    
    const resultado = await eliminarRegistro(CONFIG_VAR.tablaId, CONFIG_VAR.columnaIdBD, id); // Llamar a la función para eliminar el registro de la base de datos

    if (resultado.operacion === "true") { // Si la operación fue exitosa, mostrar mensaje de éxito y cerrar el modal
        mostrarMensajeExito("Marca eliminada correctamente");
        cerrarModal('staticBackdropEliminar');
        actualizarGrilla();
    } else { // Si hubo un error al eliminar el registro, mostrar mensaje de error
        mostrarMensajeError(resultado.mensaje || "Error al eliminar la marca");
    }
};

// Cargar datos en el modal de eliminar
const cargarDatosEnModalEliminar = (datos) => {
    document.getElementById('nombreMarcaEliminar').value = datos.nombre;
};

// Cargar datos en el modal de modificar
const cargarDatosEnModalModificar = (datos) => {
    document.getElementById('nombreMarcaModificar').value = datos.nombre;
};











