import { cerrarSesion } from '/pizzeria/assets/js/funciones.js';

const savedTheme = localStorage.getItem('data-bs-theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
} else {
    // Si no hay un valor, establecer uno por defecto (opcional)
    document.documentElement.setAttribute('data-bs-theme', 'light');
}


// Cargar el header

fetch('/pizzeria/includes/header.html')
    .then(res => res.text())
    .then(data => {
        const container = document.getElementById('header-container');
        const temp = document.createElement('div');
        temp.innerHTML = data;

        // Extraer los scripts
        const scripts = temp.querySelectorAll('script');

        // Insertar el contenido sin scripts
        container.innerHTML = '';
        [...temp.childNodes].forEach(node => {
            if (node.tagName !== 'SCRIPT') {
                container.appendChild(node);
            }
        });

        // Función para cargar scripts en orden
        const loadScriptsSequentially = (scripts, index = 0) => {
            if (index >= scripts.length) {
                // Ejecutar funciones necesarias después de que todos los scripts hayan cargado
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
                return;
            }

            const oldScript = scripts[index];
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
                // Hace que el script sea tratado como un módulo
                // Verificar si el script debe ser tratado como un módulo
                if (oldScript.type === 'module') {
                    newScript.type = 'module';
                }
                newScript.onload = () => loadScriptsSequentially(scripts, index + 1);
                newScript.onerror = () => {
                    console.error(`No se pudo cargar el script: ${oldScript.src}`);
                    loadScriptsSequentially(scripts, index + 1);
                };
            } else {
                newScript.textContent = oldScript.textContent;
                loadScriptsSequentially(scripts, index + 1);
            }
            document.body.appendChild(newScript);
        };

        loadScriptsSequentially(Array.from(scripts));

        // Agregar evento al botón de modo oscuro, luego de que se inserta el header
        const observer = new MutationObserver(() => {
            const darkModeBtn = document.querySelector('.light-dark-mode');
            if (darkModeBtn) {
                darkModeBtn.addEventListener('click', () => {
                    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-bs-theme', newTheme);
                    localStorage.setItem('data-bs-theme', newTheme);
                });
                observer.disconnect(); // Detener observación una vez encontrado
            }
        });


        // Asignar el evento click al enlace de cerrar sesión
        const cerrarSesionLink = document.getElementById('cerrarSesionLink');
        if (cerrarSesionLink) {
            cerrarSesionLink.addEventListener('click', function (event) {
                event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
                cerrarSesion(); // Llamar a la función importada
            });
        }

        observer.observe(document.getElementById('header-container'), { childList: true, subtree: true });



    })
    .catch(err => {
        console.error('Error cargando header:', err);
    });




