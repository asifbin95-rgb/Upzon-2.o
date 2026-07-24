/* ═══════════════════════════════════════════════════════════
   UPZON — main.js
   Navigation · GSAP scroll animations · Form handling
   No backend required. The inquiry form exposes a single
   integration point (submitInquiry) for future API hookup.
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  /* ─── Footer year ─── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── Nav: scrolled state ─── */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ─── Nav: mobile menu ─── */
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ─── Active nav link on scroll ─── */
  var sections = ["problems", "solutions", "framework", "process", "pricing", "faq"];
  var navAnchors = {};
  sections.forEach(function (id) {
    var a = links ? links.querySelector('a[href="#' + id + '"]') : null;
    if (a) navAnchors[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var a = navAnchors[entry.target.id];
          if (!a) return;
          if (entry.isIntersecting) {
            Object.keys(navAnchors).forEach(function (k) {
              navAnchors[k].classList.remove("is-active");
            });
            a.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ─── Pricing plan → contact form pre-select ─── */
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var planSelect = document.getElementById("f-plan");
      if (!planSelect) return;
      var plan = btn.getAttribute("data-plan");
      Array.prototype.forEach.call(planSelect.options, function (opt) {
        if (opt.text.indexOf(plan) === 0) planSelect.value = opt.value || opt.text;
      });
    });
  });

  /* ─── GSAP animations ─── */
  if (hasGSAP && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    /* Hero entrance */
    var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .to(".hero__eyebrow", { opacity: 1, y: 0, duration: 0.7 }, 0.1)
      .fromTo(
        ".hero__line",
        { opacity: 0, y: 42 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 },
        0.2
      )
      .to(".hero__sub", { opacity: 1, y: 0, duration: 0.8 }, 0.65)
      .to(".hero__actions", { opacity: 1, y: 0, duration: 0.8 }, 0.8)
      .to(".hero__tagline", { opacity: 1, y: 0, duration: 0.8 }, 0.95)
      .to(".hero__panel", { opacity: 1, y: 0, duration: 0.9 }, 0.7)
      .to(".hero__meta", { opacity: 1, y: 0, duration: 0.9 }, 1.0);

    /* Generic reveal on scroll (outside hero) */
    gsap.utils.toArray(".reveal").forEach(function (el) {
      if (el.closest(".hero")) return; // hero handled by timeline
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });

    /* Staggered groups */
    gsap.utils.toArray(".reveal-stagger").forEach(function (group) {
      gsap.to(group.children, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 85%", once: true }
      });
    });

    /* Chart line draw */
    var line = document.querySelector(".why__line");
    if (line) {
      var len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: "power2.inOut",
        scrollTrigger: { trigger: ".why__visual", start: "top 75%", once: true }
      });
      gsap.fromTo(
        ".why__area",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.2,
          delay: 0.7,
          scrollTrigger: { trigger: ".why__visual", start: "top 75%", once: true }
        }
      );
    }

    /* Subtle parallax on ambient orbs */
    gsap.utils.toArray(".ambient__orb").forEach(function (orb, i) {
      gsap.to(orb, {
        yPercent: (i + 1) * 6,
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.5 }
      });
    });
  } else {
    /* Fallback: show everything immediately */
    document.documentElement.classList.add("no-anim");
  }

  /* ─── Inquiry form ───
     Frontend-only. Replace submitInquiry() with a real API call
     later (e.g. fetch("/api/inquiry", {...})) without touching
     any markup or styling. */
  var form = document.getElementById("inquiryForm");
  var status = document.getElementById("formStatus");

  function submitInquiry(data) {
    // FUTURE BACKEND HOOK:
    // return fetch("/api/inquiry", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(data)
    // });
    console.info("Inquiry payload (connect backend here):", data);
    return new Promise(function (resolve) {
      setTimeout(resolve, 700); // simulate request
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.classList.remove("is-error");
      status.textContent = "";

      /* Validate required fields */
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        field.classList.remove("is-invalid");
        var empty = !field.value || !field.value.trim();
        var badEmail =
          field.type === "email" &&
          field.value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (empty || badEmail) {
          field.classList.add("is-invalid");
          valid = false;
        }
      });
      if (!valid) {
        status.classList.add("is-error");
        status.textContent = "Please fill in the highlighted fields correctly.";
        return;
      }

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      submitInquiry(payload)
        .then(function () {
          form.reset();
          status.textContent =
            "Thanks — your inquiry has been received. We'll reply within one business day.";
        })
        .catch(function () {
          status.classList.add("is-error");
          status.textContent =
            "Something went wrong. Please try again or reach us directly.";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Inquiry";
        });
    });

    /* Clear invalid state on input */
    form.addEventListener("input", function (e) {
      if (e.target.classList) e.target.classList.remove("is-invalid");
    });
  }
})();