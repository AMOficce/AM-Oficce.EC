const CONFIG = {
  whatsapp: "593998228348",

  // Mensaje que aparece escrito cuando el cliente abre WhatsApp
  mensaje:
    "¡Hola, AM OFFICE! 👋 Estoy interesado en sus servicios de mobiliario y amoblamiento. Me gustaría recibir más información y una cotización.",
};

/* ----------------------------------------------------------
   3) ENLACES DE WHATSAPP CON MENSAJE PREESCRITO
   ---------------------------------------------------------- */
function configurarWhatsApp() {
  document.querySelectorAll("[data-whatsapp]").forEach((enlace) => {
    // Si el botón es de un producto, se agrega cuál le interesa
    const producto = (enlace.dataset.whatsapp || "").trim();
    const texto = producto
      ? `${CONFIG.mensaje} Me interesa en especial: ${producto}.`
      : CONFIG.mensaje;

    enlace.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
  });
}

/* ----------------------------------------------------------
   4) AÑO DEL PIE DE PÁGINA
   ---------------------------------------------------------- */
function actualizarAnio() {
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
}

/* ----------------------------------------------------------
   5) SCROLL SUAVE CON MOVIMIENTO ELEGANTE
   (si el usuario prefiere menos movimiento, se usa el salto normal)
   ---------------------------------------------------------- */
const reducirMovimiento = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function desplazarA(destino, duracion = 900) {
  const encabezado = document.querySelector(".encabezado");
  const margen = encabezado ? encabezado.offsetHeight + 12 : 90;
  const inicio = window.scrollY;
  const fin = destino.getBoundingClientRect().top + inicio - margen;
  const distancia = fin - inicio;
  let tiempoInicio = null;

  function paso(ahora) {
    if (tiempoInicio === null) tiempoInicio = ahora;
    const progreso = Math.min((ahora - tiempoInicio) / duracion, 1);
    window.scrollTo(0, inicio + distancia * easeInOutCubic(progreso));
    if (progreso < 1) requestAnimationFrame(paso);
  }

  requestAnimationFrame(paso);
}

function configurarScrollSuave() {
  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      const id = enlace.getAttribute("href");
      if (id.length < 2) return;

      const destino = document.querySelector(id);
      if (!destino) return;

      evento.preventDefault();

      if (reducirMovimiento) {
        destino.scrollIntoView();
      } else {
        desplazarA(destino);
      }

      history.pushState(null, "", id);
    });
  });
}

/* ----------------------------------------------------------
   6) ANIMACIONES AL HACER SCROLL
   ---------------------------------------------------------- */
function configurarAnimaciones() {
  const elementos = document.querySelectorAll("[data-animar]");
  if (!elementos.length) return;

  if (reducirMovimiento || !("IntersectionObserver" in window)) return;

  // Pequeño retraso escalonado entre elementos hermanos
  elementos.forEach((elemento) => {
    const hermanos = Array.from(elemento.parentElement.children).filter((h) =>
      h.hasAttribute("data-animar"),
    );
    const posicion = hermanos.indexOf(elemento);
    elemento.style.setProperty("--retraso", `${posicion * 110}ms`);
    elemento.classList.add("pendiente");
  });

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.remove("pendiente");
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
  );

  elementos.forEach((elemento) => observador.observe(elemento));
}

/* ----------------------------------------------------------
   7) ENCABEZADO, BARRA DE PROGRESO Y MENÚ ACTIVO
   ---------------------------------------------------------- */
function configurarScroll() {
  const encabezado = document.querySelector(".encabezado");
  const barra = document.getElementById("progreso");
  const enlaces = document.querySelectorAll('.menu a[href^="#"]:not(.boton)');
  const secciones = Array.from(enlaces)
    .map((enlace) => document.querySelector(enlace.getAttribute("href")))
    .filter(Boolean);

  let esperando = false;

  function actualizar() {
    const y = window.scrollY;

    // Sombra del encabezado
    if (encabezado) encabezado.classList.toggle("con-sombra", y > 10);

    // Barra de progreso
    if (barra) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = `scaleX(${total > 0 ? y / total : 0})`;
    }

    // Enlace activo del menú
    const referencia = y + window.innerHeight * 0.35;
    let actual = null;
    secciones.forEach((seccion) => {
      if (seccion.offsetTop <= referencia) actual = seccion.id;
    });
    enlaces.forEach((enlace) => {
      enlace.classList.toggle(
        "activo",
        enlace.getAttribute("href") === `#${actual}`,
      );
    });

    esperando = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!esperando) {
        esperando = true;
        requestAnimationFrame(actualizar);
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", actualizar);
  actualizar();
}

/* ----------------------------------------------------------
   8) PREGUNTAS FRECUENTES: ABRIR UNA A LA VEZ
   ---------------------------------------------------------- */
function configurarPreguntas() {
  const preguntas = document.querySelectorAll(".faq details");

  preguntas.forEach((pregunta) => {
    pregunta.addEventListener("toggle", () => {
      if (!pregunta.open) return;
      preguntas.forEach((otra) => {
        if (otra !== pregunta) otra.open = false;
      });
    });
  });
}

/* ----------------------------------------------------------
   9) CARRUSEL DE PRODUCTOS (SE DESLIZA)
   ---------------------------------------------------------- */
function configurarCarrusel() {
  const pista = document.getElementById("productos-pista");
  const anterior = document.getElementById("anterior");
  const siguiente = document.getElementById("siguiente");
  const puntos = document.getElementById("puntos");
  if (!pista || !anterior || !siguiente) return;

  const tarjetas = Array.from(pista.children);
  const comportamiento = reducirMovimiento ? "auto" : "smooth";

  function paso() {
    return tarjetas.length > 1
      ? tarjetas[1].offsetLeft - tarjetas[0].offsetLeft
      : pista.clientWidth;
  }

  function posiciones() {
    const maximo = pista.scrollWidth - pista.clientWidth;
    return Math.max(1, Math.round(maximo / paso()) + 1);
  }

  function dibujarPuntos() {
    if (!puntos) return;
    puntos.innerHTML = "";
    for (let i = 0; i < posiciones(); i++) {
      const punto = document.createElement("span");
      punto.className = "punto";
      puntos.appendChild(punto);
    }
  }

  function actualizar() {
    const maximo = pista.scrollWidth - pista.clientWidth;
    anterior.disabled = pista.scrollLeft <= 2;
    siguiente.disabled = pista.scrollLeft >= maximo - 2;

    if (!puntos) return;
    const indice =
      pista.scrollLeft >= maximo - 2
        ? posiciones() - 1
        : Math.round(pista.scrollLeft / paso());
    Array.from(puntos.children).forEach((punto, i) => {
      punto.classList.toggle("activo", i === indice);
    });
  }

  anterior.addEventListener("click", () => {
    pista.scrollBy({ left: -paso(), behavior: comportamiento });
  });

  siguiente.addEventListener("click", () => {
    pista.scrollBy({ left: paso(), behavior: comportamiento });
  });

  pista.addEventListener("scroll", () => requestAnimationFrame(actualizar), {
    passive: true,
  });

  window.addEventListener("resize", () => {
    dibujarPuntos();
    actualizar();
  });

  dibujarPuntos();
  actualizar();
}

/* ----------------------------------------------------------
   INICIO
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  configurarWhatsApp();
  actualizarAnio();
  configurarScrollSuave();
  configurarAnimaciones();
  configurarScroll();
  configurarPreguntas();
  configurarCarrusel();
});
