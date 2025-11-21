document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    //  ELEMENTOS DEL DOM PRINCIPALES
    // =========================================================
    const lockScreen      = document.getElementById('lock-screen');
    // const successScreen = document.getElementById('success-screen'); // Ya no se usa
    const unlockButton    = document.getElementById('unlock-button');
    const principioInput  = document.getElementById('principio-input');
    const gema            = document.getElementById('gema-pedagogica');
    // const musica       = document.getElementById('musica-final'); // Ya no se usa

    // const downloadLogButton = document.getElementById('download-log-button'); // Ya no se usa

    // =========================================================
    //  EFECTO DE TEXTO ESCRITO (TYPEWRITER)
    // =========================================================

    /**
     * Escribe HTML carácter por carácter dentro de un elemento.
     * Respeta las etiquetas: cuando encuentra "<...>" inserta el tag completo
     * y solo anima el texto visible.
     */
    function typeHtml(element, html, speed, onComplete) {
        let i = 0;

        function step() {
            if (i >= html.length) {
                if (typeof onComplete === 'function') onComplete();
                return;
            }

            if (html[i] === '<') {
                // Detecta un tag y lo copia entero
                const closeIndex = html.indexOf('>', i);
                if (closeIndex === -1) {
                    element.innerHTML += html.slice(i);
                    if (typeof onComplete === 'function') onComplete();
                    return;
                }
                element.innerHTML += html.slice(i, closeIndex + 1);
                i = closeIndex + 1;
            } else {
                // Texto normal: un carácter
                element.innerHTML += html[i];
                i++;
            }

            setTimeout(step, speed);
        }

        step();
    }

    /**
     * Anima en secuencia todos los elementos que coincidan con el selector.
     * - selector: CSS selector (ej. "#lock-screen .typing-lock")
     * - speed: ms entre caracteres
     * - delayBetween: ms entre un elemento y el siguiente
     */
    function startTypingSequence(selector, speed, delayBetween) {
        const elements = Array.from(document.querySelectorAll(selector));

        // Guardamos el HTML original (solo la primera vez) y lo vaciamos
        elements.forEach(el => {
            if (!el.dataset.originalHtml) {
                el.dataset.originalHtml = el.innerHTML.trim();
                el.innerHTML = '';
            }
        });

        function run(index) {
            if (index >= elements.length) return;

            const el = elements[index];
            const html = el.dataset.originalHtml || '';

            typeHtml(el, html, speed, () => {
                setTimeout(() => run(index + 1), delayBetween);
            });
        }

        run(0);
    }

    // =========================================================
    //  DICCIONARIO DE PALABRAS CLAVE (ELIMINADO)
    // =========================================================
    // Ya no se usa la lista 'criteriosClave'


    // =========================================================
    //  MODAL DE PISTA / FEEDBACK (PARA ERRORES)
    // =========================================================
    
    // Crea el modal solo una vez
    function createHintModal() {
        if (document.getElementById('hint-modal-overlay')) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'hint-modal-overlay';
        modalOverlay.className = 'modal-overlay'; // Asume que 'style.css' define esto

        const modalBox = document.createElement('div');
        modalBox.className = 'modal-box'; // Asume que 'style.css' define esto

        const modalTitle = document.createElement('h2');
        modalTitle.className = 'modal-title'; // Asume que 'style.css' define esto
        modalTitle.textContent = 'ACCESO DENEGADO'; // Título genérico de error

        const modalMessage = document.createElement('p');
        modalMessage.className = 'modal-message'; // Asume que 'style.css' define esto

        const modalButton = document.createElement('button');
        modalButton.className = 'modal-button'; // Asume que 'style.css' define esto
        modalButton.textContent = 'Aceptar';

        modalBox.appendChild(modalTitle);
        modalBox.appendChild(modalMessage);
        modalBox.appendChild(modalButton);
        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);

        modalButton.addEventListener('click', closeHintModal);
    }

    // Muestra el modal con mensaje simple (texto plano)
    function showHintModal(mensaje) {
        createHintModal(); // Lo crea si no existe

        const modalOverlay = document.getElementById('hint-modal-overlay');
        const modalMessage = modalOverlay.querySelector('.modal-message');

        modalMessage.textContent = mensaje;
        modalOverlay.style.display = 'flex';
    }

    function closeHintModal() {
        const modalOverlay = document.getElementById('hint-modal-overlay');
        if (modalOverlay) modalOverlay.style.display = 'none';
    }

    // Efecto visual de error + apertura del modal adecuado
    function mostrarPista(mensaje) {

        showHintModal(mensaje); // Muestra el modal de error

        // Animación de error en gema y textarea
        gema.classList.add('error-shake');
        principioInput.classList.add('error-shake');

        setTimeout(() => {
            gema.classList.remove('error-shake');
            principioInput.classList.remove('error-shake');
        }, 500);
    }

    // =========================================================
    //  NUEVO MODAL DE ÉXITO (PISTA 2)
    // =========================================================
    function createSuccessModal() {
        if (document.getElementById('success-modal-overlay')) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'success-modal-overlay';
        modalOverlay.className = 'modal-overlay'; // Reutilizamos estilos

        const modalBox = document.createElement('div');
        modalBox.className = 'modal-box'; // Reutilizamos estilos

        // 1. Imagen (Puedes cambiar este SRC)
        const modalImage = document.createElement('img');
        modalImage.src = 'img/pista3.png';
        modalImage.alt = 'Imagen de la Pista 2';
        modalImage.style.width = '100%';
        modalImage.style.borderRadius = '8px';
        modalImage.style.marginBottom = '15px';

        // NUEVO: Texto de pista
        const modalText = document.createElement('p');
        modalText.textContent = '¿Tú aquí? Está bien... Ahora un reto más';
        modalText.style.textAlign = 'center';
        // Asumo que el CSS de la clase 'modal-box' (si existe en style.css)
        // ya maneja un color de texto legible.
        // Si no, puedes añadir: modalText.style.color = '#EEEEEE'; (si el fondo es oscuro)
        modalText.style.fontSize = '1.1rem';
        modalText.style.marginBottom = '20px'; // Espacio antes del botón

        // 2. Botón de redirección
        const modalButton = document.createElement('button');
        modalButton.className = 'modal-button'; // Reutilizamos estilos
        modalButton.textContent = 'ÚLTIMO RETO';

        modalButton.addEventListener('click', () => {
            window.location.href = '../spectre/index.html';
        });

        //modalBox.appendChild(modalImage);
        modalBox.appendChild(modalText); // ¡Aquí se añade el texto!
        modalBox.appendChild(modalButton);
        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);
    }

    function showSuccessModal() {
        createSuccessModal(); // Asegura que exista
        const modalOverlay = document.getElementById('success-modal-overlay');
        modalOverlay.style.display = 'flex';
    }

    // =========================================================
    //  Lógica de desbloqueo (REESCRITA)
    // =========================================================

    unlockButton.addEventListener('click', () => {
        const principioOriginal = principioInput.value.trim();
        const principioNormalizado = principioOriginal.toLowerCase();

        // 1. Comprobar si la palabra es "navidad"
        if (principioNormalizado === "et lux in tenebris lucet") {
            
            // ÉXITO: Mostrar el nuevo modal de éxito
            showSuccessModal();

        } else {
            
            // ERROR: La palabra no es correcta
            let mensajeError = "El lema ingresado no es el correcto o está incompleto. "+
            "Ten en cuenta que es algo que forma parte del sistema de identidad de tu casa de estudios y "+ 
            "ocupa un lugar relevante en la comunicación institucional... Sigue intentando.";
            if (principioNormalizado === "") {
                mensajeError = "Protocolo vacío. Debes ingresar el lema que los representa como comunidad PUCP.";
            }
            
            // Reutilizamos la función de pista/error existente
            mostrarPista(mensajeError);
        }
    });

    // =========================================================
    //  ESTRELLAS TITILANTES DE FONDO (CANVAS)
    // =========================================================
    const starsCanvas = document.getElementById('stars-canvas');

    if (starsCanvas && starsCanvas.getContext) {
        const starsCtx = starsCanvas.getContext('2d');
        starsCanvas.width  = window.innerWidth;
        starsCanvas.height = window.innerHeight;

        const STAR_COUNT = 80;
        const stars      = [];

        function createStar() {
            return {
                x: Math.random() * starsCanvas.width,
                y: Math.random() * starsCanvas.height,
                radius: Math.random() * 2.2 + 1.2,
                baseAlpha: Math.random() * 0.4 + 0.5,
                twinkleSpeed: Math.random() * 0.007 + 0.005,
                twinkleOffset: Math.random() * Math.PI * 2
            };
        }

        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(createStar());
        }

        function drawStars(time) {
            const t = time || 0;

            starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

            starsCtx.save();
            starsCtx.shadowBlur  = 6;
            starsCtx.shadowColor = 'rgba(255, 215, 0, 0.9)';

            stars.forEach(star => {
                const alphaRaw =
                    star.baseAlpha +
                    Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.4;
                const alpha = Math.max(0, Math.min(1, alphaRaw));

                starsCtx.beginPath();
                starsCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                starsCtx.fillStyle = `rgba(255, 230, 120, ${alpha})`;
                starsCtx.fill();
            });

            starsCtx.restore();
        }

        function animateStars(time) {
            drawStars(time);
            requestAnimationFrame(animateStars);
        }

        window.addEventListener('resize', () => {
            starsCanvas.width  = window.innerWidth;
            starsCanvas.height = window.innerHeight;

            stars.length = 0;
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push(createStar());
            }
        });

        animateStars();
    } else {
        console.warn('No se encontró el canvas de estrellas (stars-canvas).');
    }

    // =========================================================
    //  NIEVE CAYENDO (FONDO)
    // =========================================================
    const canvas = document.getElementById('snow-canvas');
    const ctx    = canvas.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles       = [];
    // let celebrationSnow = false; // Ya no se usa

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            density: Math.random(),
            color: 'rgba(255, 255, 255, 0.8)'
        };
    }

    for (let i = 0; i < 100; i++) {
        particles.push(createParticle());
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        update();
    }

    function update() {
        particles.forEach(p => {
            let fallSpeed = p.density * 0.5 + 0.2;

            // La nieve de celebración ya no se activa
            // if (celebrationSnow) { ... } 

            p.y += fallSpeed;
            p.x += Math.sin(p.y / 20) * 0.3;

            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });
    }

    function animate() {
        draw();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push(createParticle());
        }
    });

    animate();

    // =========================================================
    //  ADVERTENCIA AL SALIR (ELIMINADA)
    // =========================================================
    // Ya no es necesario advertir al salir

    // Al cargar, animamos los textos del lock-screen
    startTypingSequence('#lock-screen .typing-lock', 8, 150);

});