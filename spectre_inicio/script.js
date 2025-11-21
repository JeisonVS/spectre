document.addEventListener("DOMContentLoaded", function () {
    // 1. Selecciona los elementos
    const passwordField = document.getElementById("password");
    const loginForm = document.getElementById("login-form");

    // 3. Referencias al modal y video (ya existentes en el HTML)
    const modalOverlay = document.getElementById("spectre-modal-overlay");
    const videoElement = document.getElementById("spectre-video");

    // 4. Mostrar la modal
    function showWarningModal() {
        if (modalOverlay) {
            modalOverlay.style.display = "flex";
        }

        // *** CORRECCIÓN: Reiniciar y reproducir el video ***
        if (videoElement) {
            videoElement.currentTime = 0; // Reiniciar
            videoElement.volume = 0.5;
            // Usar .play() y catch para evitar errores si el navegador bloquea el autoplay
            videoElement.play().catch(e => console.error("Autoplay falló:", e));
        }

        // Hacer focus en el primer botón para poder cerrar con Enter (si hubiera botones)
        // En este caso, el foco se mantiene en el documento para capturar Escape
    }

    // 5. Cerrar la modal
    function closeWarningModal() {
        if (modalOverlay) {
            modalOverlay.style.display = "none";
        }

        // *** CORRECCIÓN: Detener y reiniciar el video ***
        if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0; // Reiniciar
        }
    }

    // 6. Función de bloqueo
    function blockAccess(event) {
        // Muestra el modal personalizada
        showWarningModal();

        // Quita el focus del campo
        if (passwordField && passwordField.blur) {
            passwordField.blur();
        }

        // Limpia el campo por si acaso se escribió algo
        if (passwordField) {
            passwordField.value = "";
        }
    }

    // 7. Asignar los triggers

    // Trigger A: Cuando el usuario hace clic o tabula hacia el campo de contraseña
    if (passwordField) {
        // El focus ya está siendo usado por keydown, por lo que lo dejo solo para el teclado/tabulación
        passwordField.addEventListener("focus", blockAccess);

        // Bloquear si intentan escribir directamente o usar Enter
        passwordField.addEventListener("keydown", function (event) {
            event.preventDefault(); // Evita que se escriba el caracter
            blockAccess();
        });
    }

    // Trigger B: Si el usuario intenta enviar el formulario (hace clic en ACCEDER)
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            // Detiene el envío del formulario
            event.preventDefault();

            // Muestra la modal
            showWarningModal();
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeWarningModal();
        }
    });

    // Cerrar modal al hacer clic fuera de la caja
    document.addEventListener("click", function (event) {
        if (modalOverlay && event.target === modalOverlay) {
            closeWarningModal();
        }
    });
});