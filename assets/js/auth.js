import { validarFormulario } from '/pizzeria/assets/js/funciones.js';

export const configurarValidacionFormularioLogin = (formId) => {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Formulario con ID "${formId}" no encontrado.`);
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevenir el envío por defecto

        if (validarFormulario(formId)) {
            // Si el formulario es válido, puedes proceder con el envío o la lógica adicional
            validarAccesoUsuario();
        }
    });
};


export const validarAccesoUsuario = () => {
    var datosFormulario = $("#formAcceso").serialize() + "&accion=validarAcceso";
    $.ajax({
        type: 'POST',
        url: 'servicios/servicios.php',
        data: datosFormulario,
        dataType: 'json',
        success: function (json) {
            if (json.operacion === "true") {
                localStorage.usuariologueado = "1";
                localStorage.usuarionombre = $("#loginname").val();
                location.href = "menu.html";
            } else {
                Swal.fire({
                    title: "Usuario y/o contraseña incorrecta!",
                    text: "Intente de nuevo",
                    icon: "error" //question, error, info, warning, success
                });
            }
        },
        error: function (jqXHR) {
            
            Swal.fire({
                title: "Error del Servidor",
                text: "Hubo un error al conectarse con el servidor",
                icon: "error" //question, error, info, warning, success
            });
        }
    });
};




// export const siguienteCampo = (actual, siguiente, preventDefault) => {
//     $(actual).keydown(function (event) {
//         if (event.which === 13) {
//             if (preventDefault) {
//                 event.preventDefault();
//             }
//             $(siguiente).focus();
//             $(siguiente).select();
//         }
//     });
// };