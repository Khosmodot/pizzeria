import { cerrarSesion } from '/pizzeria/assets/js/funciones.js';

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
            if (index >= scripts.length) return;

            const oldScript = scripts[index];
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
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

        // Asignar el evento click al enlace de cerrar sesión
        const cerrarSesionLink = document.getElementById('cerrarSesionLink');
        if (cerrarSesionLink) {
            cerrarSesionLink.addEventListener('click', function (event) {
                event.preventDefault();
                cerrarSesion();
            });
        }

        // Agregar eventos de "hover" para los menús desplegables (solo en pantallas grandes)
        const dropdowns = document.querySelectorAll('.nav-item.dropdown');

        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            // Mostrar el menú al pasar el mouse (solo en pantallas grandes)
            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth > 991) {
                    menu.classList.add('show');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            });

            // Ocultar el menú al quitar el mouse (solo en pantallas grandes)
            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth > 991) {
                    menu.classList.remove('show');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Evitar que el menú de usuario se cierre al hacer clic en áreas no interactivas
        const userDropdownMenu = document.querySelector('#userDropdown + .dropdown-menu');
        if (userDropdownMenu) {
            userDropdownMenu.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
    })
    .catch(err => {
        console.error('Error cargando header:', err);
    });




