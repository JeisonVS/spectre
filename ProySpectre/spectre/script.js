document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    //  ELEMENTOS DEL DOM PRINCIPALES
    // =========================================================
    const lockScreen      = document.getElementById('lock-screen');
    const successScreen   = document.getElementById('success-screen');
    const unlockButton    = document.getElementById('unlock-button');
    const principioInput  = document.getElementById('principio-input');
    const gema            = document.getElementById('gema-pedagogica');
    const musica          = document.getElementById('musica-final');
    
    // NUEVO: Referencia al elemento donde mostraremos el texto final
    const resultadoPrincipioDisplay = document.getElementById('resultado-principio');

    // Contador de intentos para el principio pedagógico
    let intentosPrincipio = 0;

    // Elementos del encabezado que se ocultan al finalizar
    const logoIDU     = document.querySelector('.logo-idu');
    const logoSpectre = document.querySelector('.logo-spectre');
    const introText   = document.querySelector('.intro-text');
    const pixelLogo   = document.querySelector('.logo-pixel');

    // Botón de descarga de principios guardados
    const downloadLogButton = document.getElementById('download-log-button');
    let datosSinDescargar = false;
    let successTypingStarted = false;   // Para no repetir la animación

    // =========================================================
    //  EFECTO DE TEXTO ESCRITO (TYPEWRITER)
    // =========================================================

    /**
     * Escribe HTML carácter por carácter dentro de un elemento.
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
    //  DICCIONARIO DE PALABRAS CLAVE (REQUERIDAS)
    // =========================================================
    const criteriosClave = [
        "equidad", "juicio critico", "responsabilidad"
    ];

    // =========================================================
    //  MODAL DE PISTA / FEEDBACK
    // =========================================================
    // Mensaje HTML fijo para el análisis de protocolo incompleto
    const MENSAJE_ANALISIS_HTML =
        'La frase presentada no cumple con los requisitos de seguridad del sistema.' +
        '<br><br>Recuerden que debe ser una frase redactada a CONCIENCIA y debe contener las tres palabras de las tarjetas que usaste para descubrir las pistas.' +
        '<br><br>Ajusten su propuesta y vuelvan a intentarlo.';

    // Crea el modal solo una vez
    function createHintModal() {
        if (document.getElementById('hint-modal-overlay')) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'hint-modal-overlay';
        modalOverlay.className = 'modal-overlay';

        const modalBox = document.createElement('div');
        modalBox.className = 'modal-box';

        const modalTitle = document.createElement('h2');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = 'ACCESO DENEGADO';

        const modalMessage = document.createElement('p');
        modalMessage.className = 'modal-message';

        const modalButton = document.createElement('button');
        modalButton.className = 'modal-button';
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
        createHintModal();

        const modalOverlay = document.getElementById('hint-modal-overlay');
        const modalMessage = modalOverlay.querySelector('.modal-message');

        modalMessage.textContent = mensaje;
        modalOverlay.style.display = 'flex';
    }

    // Muestra SIEMPRE el mensaje HTML de análisis incompleto
    function mostrarAnalisisIncompleto() {
        createHintModal();

        const modalOverlay = document.getElementById('hint-modal-overlay');
        const modalMessage = modalOverlay.querySelector('.modal-message');

        // Usamos el HTML definido
        modalMessage.innerHTML = MENSAJE_ANALISIS_HTML;
        modalOverlay.style.display = 'flex';
    }

    function closeHintModal() {
        const modalOverlay = document.getElementById('hint-modal-overlay');
        if (modalOverlay) modalOverlay.style.display = 'none';
    }

    // Efecto visual de error + apertura del modal adecuado
    function mostrarPista(mensaje, tipo = 'simple') {

        if (tipo === 'analisis') {
            mostrarAnalisisIncompleto();
        } else {
            showHintModal(mensaje);
        }

        // Animación de error en gema y textarea
        gema.classList.add('error-shake');
        principioInput.classList.add('error-shake');

        setTimeout(() => {
            gema.classList.remove('error-shake');
            principioInput.classList.remove('error-shake');
        }, 500);
    }

    // =========================================================
    //  Guardar el principi pedagógico en el localStorage
    // =========================================================
    function guardarPrincipioEnStorage(textoPrincipio) {
        try {
            const fechaHora = new Date().toLocaleString('es-PE', {
                dateStyle: 'short',
                timeStyle: 'medium'
            });

            const nuevaEntrada = `[${fechaHora}] ${textoPrincipio}`;

            const registrosAnteriores = localStorage.getItem('principiosGuardados');
            let listaDePrincipios = registrosAnteriores ? JSON.parse(registrosAnteriores) : [];

            listaDePrincipios.push(nuevaEntrada);
            localStorage.setItem('principiosGuardados', JSON.stringify(listaDePrincipios));

            datosSinDescargar = true; // Marca que hay datos nuevos sin descargar
            console.log('Principio guardado en localStorage:', nuevaEntrada);
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    // =========================================================
    //  Lógica de desbloqueo ACTUALIZADA
    //  - Verifica > 30 caracteres
    //  - Verifica presencia de TODAS las palabras clave: equidad, juicio critico, navidad3
    //  - NORMALIZA EL TEXTO (quita tildes)
    // =========================================================

    unlockButton.addEventListener('click', () => {
        const principioOriginal = principioInput.value.trim();
        
        // --- NORMALIZACIÓN AVANZADA ---
        // 1. toLowerCase(): convierte a minúsculas.
        // 2. normalize("NFD"): descompone caracteres (ej: 'á' se vuelve 'a' + '´').
        // 3. replace(...): elimina los caracteres diacríticos (las tildes sueltas).
        const principioNormalizado = principioOriginal.toLowerCase()
                                      .normalize("NFD")
                                      .replace(/[\u0300-\u036f]/g, "");

        // 1. Validación de Longitud (> 30 caracteres)
        if (principioNormalizado.length <= 70) {
            mostrarPista(
                "Esta frase es demasiado corta, humano. Escriban una frase más detallada."
            );
            return;
        }

        // 2. Validación de Palabras Clave (Deben estar las 3)
        // Al estar el input normalizado, 'juicio crítico' se convierte en 'juicio critico', 
        // lo cual coincide con tu array 'criteriosClave'.
        const todasLasPalabrasPresentes = criteriosClave.every(palabra => 
            principioNormalizado.includes(palabra)
        );

        if (todasLasPalabrasPresentes) {
            // =====================================================
            //         ÉXITO: CUMPLE TODAS LAS CONDICIONES
            // =====================================================

            // Guardamos el principio original antes de mostrar el éxito
            guardarPrincipioEnStorage(principioOriginal);

            // Mostramos el principio en la pantalla de éxito
            if (resultadoPrincipioDisplay) {
                resultadoPrincipioDisplay.textContent = `"${principioOriginal}"`;
            }

            // Activamos la gema y ocultamos el panel del reto
            gema.classList.add('active');
            lockScreen.style.opacity = '0';
            lockScreen.style.transform = 'scale(0.9)';

            setTimeout(() => {
                // Ocultamos el texto/narrativa del reto
                lockScreen.classList.add('hidden');

                // Ocultamos el encabezado / logos
                [logoIDU, logoSpectre, introText, pixelLogo].forEach(el => {
                    if (el) el.classList.add('hidden');
                });

                // Mostramos la pantalla de éxito
                successScreen.classList.remove('hidden');

                // Iniciar animación de tipeo en la pantalla de desbloqueo (solo una vez)
                if (!successTypingStarted) {
                    successTypingStarted = true;
                    startTypingSequence('#success-screen .typing-success', 8, 150);
                }

                // Activar “modo celebración” (nieve dorada + música)
                celebrationSnow = true;
                if (musica) {
                    musica.loop = true;
                    musica.play();
                }
            }, 500);

        } else {
            // =====================================================
            //      FALLO: FALTAN PALABRAS CLAVE
            // =====================================================
            mostrarPista("", "analisis");
        }
    });

    // =========================================================
    //  DESCARGA DEL REGISTRO DE PRINCIPIOS
    // =========================================================
    downloadLogButton.addEventListener('click', () => {
        try {
            const registrosGuardados = localStorage.getItem('principiosGuardados');
            if (!registrosGuardados || registrosGuardados === '[]') {
                alert('No hay principios registrados para descargar.');
                return;
            }

            const listaDePrincipios   = JSON.parse(registrosGuardados);
            const contenidoDelArchivo = listaDePrincipios.join('\r\n\r\n');

            const blob = new Blob([contenidoDelArchivo], {
                type: 'text/plain;charset=utf-8'
            });

            const link = document.createElement('a');
            link.href     = URL.createObjectURL(blob);
            link.download = 'principios.txt';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            datosSinDescargar = false;
            // descomentar si se quiere impiar el registro tras descargar
            // localStorage.removeItem('principiosGuardados');
        } catch (error) {
            console.error('Error al descargar el registro:', error);
            alert('Hubo un error al preparar el archivo de descarga.');
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
    let celebrationSnow = false;

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

            if (celebrationSnow) {
                fallSpeed = p.density * 5 + 2;
            }

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
    //  ADVERTENCIA AL SALIR SIN DESCARGAR PRINCIPIOS
    // =========================================================
    window.addEventListener('beforeunload', (event) => {
        if (datosSinDescargar) {
            event.preventDefault();
            event.returnValue = '';
            return 'Hay principios guardados que no se han descargado. ¿Estás seguro de que quieres salir?';
        }
    });

    // Al cargar, animamos los textos del lock-screen
    startTypingSequence('#lock-screen .typing-lock', 8, 150);

});