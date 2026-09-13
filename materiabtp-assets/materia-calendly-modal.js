(() => {
  const CALENDLY_DEMO_URL =
    "https://calendly.com/matertiabtp-demo/30min?month=2026-09&hide_gdpr_banner=1&primary_color=0035A9";

  const modal = document.getElementById("demo-modal");
  const embed = document.getElementById("calendly-embed");
  const closeBtn = modal?.querySelector(".demo-modal__close");
  const backdrop = modal?.querySelector(".demo-modal__backdrop");
  let mounted = false;

  if (!modal || !embed) return;

  function mountCalendly() {
    if (mounted || !window.Calendly?.initInlineWidget) return;
    window.Calendly.initInlineWidget({
      url: CALENDLY_DEMO_URL,
      parentElement: embed,
    });
    mounted = true;
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    mountCalendly();
    requestAnimationFrame(() => closeBtn?.focus());
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".btn-calendly")) {
      event.preventDefault();
      openModal();
    }
  });

  closeBtn?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  const widgetScript = document.createElement("script");
  widgetScript.src = "https://assets.calendly.com/assets/external/widget.js";
  widgetScript.async = true;
  widgetScript.onload = mountCalendly;
  document.head.appendChild(widgetScript);
})();
