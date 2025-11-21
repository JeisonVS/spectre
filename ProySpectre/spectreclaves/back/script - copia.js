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
    //  DICCIONARIO DE PALABRAS CLAVE (GEMA PEDAGÓGICA)
    // =========================================================
    //  Aquí se concentran las palabras clave y sus variantes que
    //  se buscarán dentro del principio pedagógico.
    const criteriosClave = [
        // 1. Autoría / originalidad / voz propia
        "autoría","autoria","autor","autora","autores","original","originales",
        "originalidad","auténtico","autentico","auténtica","autentica",
        "autenticidad","genuino","genuina","creatividad","creativo","creativa",
        "creación propia","producción propia","produccion propia","trabajo propio",
        "trabajos propios","voz propia","estilo propio","aporte personal",
        "elaboración personal","elaboracion personal",

        // 2. Integridad académica / ética académica
        "integridad académica","integridad academica","integridad",
        "honestidad académica","honestidad academica","honestidad",
        "ética académica","etica academica","ética","etica",
        "ética profesional","etica profesional","comportamiento ético",
        "comportamiento etico","conducta ética","conducta etica",
        "probidad","rectitud","rigor académico","rigor academico",

        // 3. Uso ético y responsable de la IA
        "uso ético","uso etico","uso responsable","ia ética","ia etica",
        "ia responsable","inteligencia artificial ética","inteligencia artificial etica",
        "decisiones éticas sobre ia","decisiones eticas sobre ia",
        "ética tecnológica","etica tecnologica","ética digital","etica digital",
        "responsabilidad digital","responsabilidad tecnológica","responsabilidad tecnologica",
        "prácticas éticas con ia","practicas eticas con ia",

        // 4. Transparencia
        "transparencia","transparente","claridad","comunicación clara",
        "comunicacion clara","apertura","explicación explícita",
        "explicacion explicita","declarar uso","declarar información",
        "declarar informacion","hacer visible el proceso",
        "rendición de cuentas","rendicion de cuentas",

        // 5. Pensamiento / juicio crítico
        "pensamiento crítico","pensamiento critico","juicio crítico","juicio critico",
        "análisis crítico","analisis critico","reflexión crítica","reflexion critica",
        "mirada crítica","mirada critica","evaluación crítica","evaluacion critica",
        "criterio propio","razonamiento propio","análisis profundo","analisis profundo",

        // 6. Equidad / justicia / imparcialidad
        "equidad","equitativo","equitativa","justicia","justo","justa",
        "imparcialidad","imparcial","neutralidad","trato justo","trato equitativo",
        "no discriminación","no discriminacion","decisiones imparciales",
        "decisión imparcial","decision imparcial","decisiones justas",
        "objetividad","objetivo","objetiva",

        // 7. Responsabilidad docente / decisiones informadas
        "responsabilidad docente","responsabilidad pedagógica","responsabilidad pedagogica",
        "responsabilidad profesional","responsabilidad educativa","responsable",
        "decisiones informadas","decisión informada","decision informada",
        "decisiones fundamentadas","decisión fundamentada","decision fundamentada",
        "decisiones razonadas","juicio profesional","criterio docente",
        "orientación docente","orientacion docente",
        "acompañamiento docente","acompanamiento docente",

        // 8. Pertinencia / coherencia evaluativa
        "pertinencia","criterios pertinentes","criterio pertinente",
        "criterios válidos","criterios validos","criterios justificados",
        "coherencia evaluativa","coherente","coherencia","consistencia",
        "alineamiento pedagógico","alineamiento pedagogico",
        "fundamento académico","fundamento academico",
        "fundamentación pedagógica","fundamentacion pedagogica",

        // 9. Privacidad / protección de datos / consentimiento
        "privacidad","privado","privada","intimidad","confidencialidad",
        "resguardo de datos","protección de datos","proteccion de datos",
        "datos protegidos","seguridad de la información",
        "seguridad de la informacion","manejo ético de datos",
        "manejo etico de datos","datos personales","consentimiento",
        "consentimiento informado","autorización informada",
        "autorizacion informada","uso responsable de datos",
        "tratamiento ético de datos","tratamiento etico de datos",
        "reserva de información","reserva de informacion",
        "protección de la identidad","proteccion de la identidad",

        // 10. Autonomía / confianza digital
        "autonomía","autonomia","autonomía del estudiante",
        "autonomia del estudiante","autodeterminación","autodeterminacion",
        "independencia","libertad pedagógica","libertad pedagogica",
        "confianza digital","ambientes confiables","entorno seguro",
        "seguridad digital",

        // 11. Proporcionalidad / límites éticos
        "proporcionalidad","proporcional","límites éticos","limites eticos",
        "límites razonables","limites razonables","marcos éticos","marcos eticos",
        "fronteras éticas","fronteras eticas","restricciones éticas",
        "restricciones eticas","evitar excesos","intervención proporcional",
        "intervencion proporcional",

        // 12. Humanización / enfoque humano
        "humanización","humanizacion","humanizar","enfoque humano",
        "perspectiva humana","centralidad del estudiante",
        "centralidad en la persona","trato humano","mirada humanista",
        "vínculo humano","vinculo humano","relación pedagógica humana",
        "relacion pedagogica humana","sensibilidad pedagógica",
        "sensibilidad pedagogica",

        // 13. Criterio ético
        "criterio ético","criterio etico","criterios éticos","criterios eticos",
        "juicio ético","juicio etico","perspectiva ética","perspectiva etica",
        "visión ética","vision etica","orientación ética","orientacion etica",
        "evaluación ética","evaluacion etica","razonamiento ético",
        "razonamiento etico",

        // 14. Coherencia pedagógica
        "coherencia pedagógica","coherencia pedagogica",
        "alineación pedagógica","alineacion pedagogica",
        "consistencia pedagógica","consistencia pedagogica",
        "lógica pedagógica","logica pedagogica",
        "enfoque pedagógico coherente","enfoque pedagogico coherente",
        "visión pedagógica integrada","vision pedagogica integrada",

        // 15. Buen juicio / discernimiento
        "buen juicio","juicio sólido","juicio solido","discernimiento",
        "criterio","criterio sólido","criterio solido",
        "juicio equilibrado","visión prudente","vision prudente"
    ];

    // =========================================================
    //  MODAL DE PISTA / FEEDBACK
    // =========================================================
    // Mensaje HTML fijo para el análisis de protocolo incompleto
    const MENSAJE_ANALISIS_HTML =
        'El principio presentado aún no refleja plenamente la profundidad ética y pedagógica que exige este protocolo.' +
        '<br><br><strong> </strong> Revisen los desafíos superados y consideren cómo integrar, de manera coherente, los aspectos vinculados a la ' +
        '<strong>autenticidad del trabajo académico</strong>, la <strong>justicia en los procesos de decisión</strong> y la ' +
        '<strong>protección responsable de la información</strong>.' +
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
        modalTitle.textContent = 'ANÁLISIS DE PROTOCOLO INCOMPLETO';

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
    // - Para protocolo vacío usaremos showHintModal (texto simple)
    // - Para análisis incompleto usaremos mostrarAnalisisIncompleto()
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
    //  Lógica de desbloqueo
    //  - Primer intento: siempre rechazo.
    //  - A partir del segundo intento: exige ≥ 2 palabras clave.
    //  - Si no hay cambios respecto al intento anterior, también rechaza.
    // =========================================================

    let ultimoPrincipioNormalizado = "";    // para detectar si hubo cambios

    unlockButton.addEventListener('click', () => {
        const principioOriginal = principioInput.value.trim();
        const principioNormalizado = principioOriginal.toLowerCase();

        // 1. Campo vacío -> mensaje específico (usar texto simple)
        if (principioNormalizado === "") {
            intentosPrincipio++;  // igual cuenta como intento

            mostrarPista(
                "Protocolo vacío. Han desperdiciado un intento valioso. " +
                "El sistema no se restaura con silencio, sino con reflexión.",
                "simple"
            );
            return;
        }

        // 2. Si el texto es exactamente el mismo que el utilizado en el intento anterior
        //    (no hubo cambios), se rechaza siempre mostrando el mismo mensaje de análisis.
        if (intentosPrincipio > 0 && principioNormalizado === ultimoPrincipioNormalizado) {
            intentosPrincipio++;  // aumenta el contador
            mostrarPista("", "analisis");
            return;
        }

        // 3. Hay texto y sí hubo cambios → registramos nuevo intento y guardamos el texto
        intentosPrincipio++;
        ultimoPrincipioNormalizado = principioNormalizado;

        // 4. Primer intento con texto (no vacío) → siempre se rechaza
        if (intentosPrincipio === 1) {
            // Siempre este mensaje HTML
            mostrarPista("", "analisis");
            return;
        }

        // 5. A partir del segundo intento: contar cuántas palabras clave aparecen
        let coincidencias = 0;
        for (const criterio of criteriosClave) {
            if (principioNormalizado.includes(criterio)) {
                coincidencias++;
                if (coincidencias >= 3) break; // basta con saber que llegó a 3
            }
        }

        const principioValido = coincidencias >= 3;

        if (principioValido) {
            // =====================================================
            //       ÉXITO: PRINCIPIO VÁLIDO Y NO ES PRIMER INTENTO
            // =====================================================

            // Guardamos el principio original antes de mostrar el éxito
            guardarPrincipioEnStorage(principioOriginal);

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

                // Activamos nieve de celebración + música
                celebrationSnow = true;
                if (musica) {
                    musica.loop = true;
                    musica.play();
                }
            }, 500);

        } else {
            // =====================================================
            //     SEGUNDO (O MÁS) INTENTO, PERO INSUFICIENTE
            // =====================================================
            // Mismo mensaje
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
