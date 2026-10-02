(function () {
  var root = document.documentElement;

  /* ---- Comutatorul de lumină (temă deschisă / închisă) ---- */
  var lightswitch = document.querySelector(".lightswitch");

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function syncSwitch() {
    if (!lightswitch) return;
    var on = currentTheme() === "light";
    lightswitch.setAttribute("aria-pressed", String(on));
    lightswitch.setAttribute("aria-label", on ? "Lumină aprinsă. Stinge lumina" : "Lumină stinsă. Aprinde lumina");
    lightswitch.title = on ? "Stinge lumina" : "Aprinde lumina";
  }

  if (lightswitch) {
    syncSwitch();
    lightswitch.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("unilux-theme", next);
      } catch (e) {}
      syncSwitch();
    });
  }

  /* ---- Meniu mobil ---- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* ---- Apariție la scroll ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-wait");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("reveal-wait");
        revealObserver.observe(el);
      }
    });
  }

  /* ---- Produse: căutare + evidențierea categoriei curente ---- */
  var search = document.getElementById("brand-search");
  if (search) {
    var brands = Array.prototype.slice.call(document.querySelectorAll(".brand"));
    var categories = Array.prototype.slice.call(document.querySelectorAll(".category"));
    var empty = document.getElementById("brand-empty");

    function normalize(text) {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
    }

    search.addEventListener("input", function () {
      var q = normalize(search.value.trim());
      var visible = 0;
      brands.forEach(function (brand) {
        var match = !q || normalize(brand.textContent).indexOf(q) !== -1;
        brand.hidden = !match;
        if (match) visible++;
      });
      categories.forEach(function (cat) {
        cat.hidden = !cat.querySelector(".brand:not([hidden])");
      });
      if (empty) empty.hidden = visible !== 0;
    });

    var catLinks = Array.prototype.slice.call(document.querySelectorAll(".catnav a"));
    if ("IntersectionObserver" in window && catLinks.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            catLinks.forEach(function (link) {
              link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
            });
          });
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      categories.forEach(function (cat) {
        spy.observe(cat);
      });
    }
  }

  /* ---- Portofoliu: filtrare pe sectoare ---- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  if (chips.length) {
    var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
    chips.forEach(function (chip) {
      var filter = chip.getAttribute("data-filter");
      var count = chip.querySelector("small");
      if (count) {
        count.textContent =
          filter === "toate"
            ? projects.length
            : projects.filter(function (p) {
                return p.getAttribute("data-sector") === filter;
              }).length;
      }
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        projects.forEach(function (p) {
          p.hidden = filter !== "toate" && p.getAttribute("data-sector") !== filter;
        });
      });
    });
  }

  /* ---- Contact: formularul deschide clientul de e-mail cu mesajul completat ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var brandParam = params.get("produs");
    if (brandParam && form.elements.mesaj) {
      form.elements.mesaj.value = "Doresc o ofertă pentru produse " + brandParam + ".\n\n";
      form.elements.subiect.value = "Cerere de ofertă";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var lines = [
        "Nume: " + f.nume.value,
        "Companie: " + f.companie.value,
        "Oraș: " + f.oras.value,
        "E-mail: " + f.email.value,
        "Telefon: " + f.telefon.value,
        "",
        f.mesaj.value
      ];
      var subject = f.subiect.value + " — " + (f.companie.value || f.nume.value);
      window.location.href =
        "mailto:contact@uniluxinternational.ro?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));
      var status = document.getElementById("form-status");
      if (status) status.hidden = false;
    });
  }

  /* ---- Anul din footer ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
