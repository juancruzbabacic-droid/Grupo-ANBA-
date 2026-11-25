// Datos de contacto: completar cuando estén definidos.
// whatsapp: solo números con código de país, ej. "5491112345678"
const CONTACTO = { whatsapp: "5491131039452", email: "" };

(function () {
  // Header con fondo al hacer scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Menú móvil
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Cerrar" : "Menú";
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menú";
    })
  );

  // Botones "Consultar" preseleccionan el proyecto en el formulario
  const interes = document.getElementById("f-interes");
  document.querySelectorAll("[data-proyecto]").forEach((b) =>
    b.addEventListener("click", () => { interes.value = b.dataset.proyecto; })
  );

  // Aparición suave de bloques (el contenido es visible si no hay JS)
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const targets = document.querySelectorAll(".section-head, .about-grid, .values, .eco-head, .eco-brands, .process, .project-card, .pd-grid, .gallery figure, .amenities figure, .unit, .unit-table, .planviewer, .done-grid, .inv-grid, .contact-grid");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // lo que ya está en pantalla no se oculta
      t.classList.add("reveal");
      io.observe(t);
    });
    document.documentElement.classList.add("js-reveal");
  }

  // Visor de planos (pestañas)
  document.querySelectorAll(".planviewer").forEach((pv) => {
    const img = pv.querySelector(".pv-stage img");
    const cap = pv.querySelector(".pv-stage figcaption");
    pv.querySelectorAll(".pv-tab").forEach((tab) =>
      tab.addEventListener("click", () => {
        pv.querySelectorAll(".pv-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");
        img.src = tab.dataset.src;
        img.alt = tab.dataset.cap;
        cap.textContent = tab.dataset.cap;
      })
    );
  });

  // Lightbox
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCap = document.getElementById("lb-cap");
  let group = [], idx = 0;
  const show = () => {
    const it = group[idx];
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCap.textContent = it.alt + (group.length > 1 ? "  ·  " + (idx + 1) + " / " + group.length : "");
  };
  document.querySelectorAll("[data-lightbox]").forEach((img) =>
    img.addEventListener("click", () => {
      const pv = img.closest(".planviewer");
      if (pv) {
        group = Array.from(pv.querySelectorAll(".pv-tab")).map((t) => ({ src: t.dataset.src, alt: t.dataset.cap }));
        idx = Math.max(0, Array.from(pv.querySelectorAll(".pv-tab")).findIndex((t) => t.getAttribute("aria-selected") === "true"));
      } else {
        const seen = new Set();
        group = Array.from(document.querySelectorAll('[data-lightbox="' + img.dataset.lightbox + '"]'))
          .filter((el) => !seen.has(el.src) && seen.add(el.src))
          .map((el) => ({ src: el.currentSrc || el.src, alt: el.alt }));
        idx = Math.max(0, group.findIndex((o) => o.src === (img.currentSrc || img.src)));
      }
      show();
      lb.hidden = false;
      document.getElementById("lb-close").focus();
    })
  );
  const close = () => { lb.hidden = true; };
  const step = (d) => { idx = (idx + d + group.length) % group.length; show(); };
  document.getElementById("lb-close").addEventListener("click", close);
  document.getElementById("lb-prev").addEventListener("click", () => step(-1));
  document.getElementById("lb-next").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // Formulario: arma el mensaje y lo abre en WhatsApp o email
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.nombre, tel = form.telefono;
    let ok = true;
    [nombre, tel].forEach((f) => {
      const bad = !f.value.trim();
      f.setAttribute("aria-invalid", String(bad));
      if (bad) ok = false;
    });
    if (!ok) { status.textContent = "Complete su nombre y teléfono para que podamos contactarlo."; return; }

    const texto =
      "Hola Grupo ANBA, soy " + nombre.value.trim() + ". Me interesa: " + form.interes.value + "." +
      (form.mensaje.value.trim() ? " " + form.mensaje.value.trim() : "") +
      " Mi teléfono: " + tel.value.trim() + (form.email.value.trim() ? " · Email: " + form.email.value.trim() : "");

    if (CONTACTO.whatsapp) {
      window.location.href = "https://wa.me/" + CONTACTO.whatsapp + "?text=" + encodeURIComponent(texto);
      status.textContent = "Abrimos WhatsApp con su consulta lista para enviar.";
    } else if (CONTACTO.email) {
      window.location.href = "mailto:" + CONTACTO.email + "?subject=" + encodeURIComponent("Consulta web: " + form.interes.value) + "&body=" + encodeURIComponent(texto);
      status.textContent = "Abrimos su correo con la consulta lista para enviar.";
    } else {
      status.textContent = "Escríbanos al WhatsApp 11 3103-9452.";
    }
  });
})();
