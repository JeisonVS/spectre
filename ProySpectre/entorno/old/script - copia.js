document.addEventListener("DOMContentLoaded", function() {
    // 1. Selecciona los elementos
    const passwordField = document.getElementById("password");
    const loginForm = document.getElementById("login-form");
    
    // Título y mensaje del modal de Spectre
    const spectreTitle   = "ACCESO BLOQUEADO";
    const spectreMessage = "¡Fascinante! Sus decisiones han debilitado mis defensas, pero no lo suficiente. Solo un último desafío revelará si su juicio merece restaurar el sistema.";

    // 3. Crear la modal de warning (solo una vez)
    function createWarningModal() {
        // Verificar si ya existe
        if (document.getElementById("spectre-modal-overlay")) {
            return;
        }
        
        // --- Overlay ---
        const modalOverlay = document.createElement("div");
        modalOverlay.id = "spectre-modal-overlay";
        modalOverlay.className = "modal-overlay"; // Modal de protocolo
        
        // --- Caja del modal ---
        const modalBox = document.createElement("div");
        modalBox.className = "modal-box";
        
        // Título rojo
        const modalTitle = document.createElement("h2");
        modalTitle.className = "modal-title";
        modalTitle.textContent = spectreTitle;
        
        // Mensaje
        const modalMessage = document.createElement("p");
        modalMessage.className = "modal-message";
        modalMessage.textContent = spectreMessage;
        
        // Contenedor de botones
        const modalActions = document.createElement("div");
        modalActions.className = "modal-actions";
        
        // Botón Cerrar
        const btnCerrar = document.createElement("button");
        btnCerrar.className = "modal-button";
        btnCerrar.textContent = "Cerrar";
        btnCerrar.addEventListener("click", closeWarningModal);
        
        // Botón Ir a reto 4
        const btnReto4 = document.createElement("button");
        btnReto4.className = "modal-button";
        btnReto4.textContent = "Avanzar";
        btnReto4.addEventListener("click", function () {
            // TODO: actualiza esta ruta con la URL real de tu reto 4 / página de Spectre
            window.location.href = "../spectre/index.html";
        });
        
        // Ensamblar
        modalActions.appendChild(btnReto4);
        modalActions.appendChild(btnCerrar);
        
        modalBox.appendChild(modalTitle);
        modalBox.appendChild(modalMessage);
        modalBox.appendChild(modalActions);
        
        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);
    }
    
    // 4. Mostrar la modal
    function showWarningModal() {
        createWarningModal();
        const modal = document.getElementById("spectre-modal-overlay");
        modal.style.display = "flex";
        
        // Hacer focus en el primer botón para poder cerrar con Enter
        setTimeout(() => {
            const btn = modal.querySelector(".modal-button");
            if (btn) btn.focus();
        }, 100);
    }
    
    // 5. Cerrar la modal
    function closeWarningModal() {
        const modal = document.getElementById("spectre-modal-overlay");
        if (modal) {
            modal.style.display = "none";
        }
    }
    
    // 6. Función de bloqueo
    function blockAccess(event) {
        // Muestra la modal personalizada
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
    
    // 7. Asigna los triggers
    
    // Trigger A: Cuando el usuario hace clic o tabula hacia el campo de contraseña
    if (passwordField) {
        passwordField.addEventListener("focus", blockAccess);
        
        // También bloquear si intentan escribir directamente
        passwordField.addEventListener("keydown", function(event) {
            event.preventDefault();
            blockAccess();
        });
    }
    
    // Trigger B: Si el usuario intenta enviar el formulario
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            // Detiene el envío del formulario
            event.preventDefault(); 
            
            // Muestra la modal
            showWarningModal();
        });
    }
    
    // Cerrar modal con tecla Escape
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeWarningModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera de la caja
    document.addEventListener("click", function(event) {
        const modal = document.getElementById("spectre-modal-overlay");
        if (modal && event.target === modal) {
            closeWarningModal();
        }
    });
});
