/* ==========================================================================
   Life Way's Medical — Script
   ========================================================================== */
(function () {
  "use strict";

  /* ============================================================
     ⚙️ إعدادات سهلة التعديل — رقم الهاتف والواتساب
     غيّر القيم هنا فقط، وستنعكس تلقائيًا في كل الموقع (الأزرار + نموذج الحجز)
     ============================================================ */
  const CLINIC_PHONE_LOCAL = "0554080703";        // رقم الاتصال المحلي المعروض
  const CLINIC_WHATSAPP_INTL = "966554080703";    // رقم واتساب بالصيغة الدولية بدون + أو أصفار
  const CLINIC_NAME_AR = "عيادات لايف ويز الطبية";
  const CLINIC_NAME_EN = "Life Way's Medical Clinics";

  /* ============================================================
     1) تبديل اللغة (عربي افتراضي / إنجليزي) + حفظ الاختيار
     ============================================================ */
  const html = document.documentElement;
  const body = document.body;
  const langBtn = document.getElementById("langToggleBtn");

  function applyLanguage(lang) {
    const isAr = lang === "ar";
    html.setAttribute("lang", isAr ? "ar" : "en");
    html.setAttribute("dir", isAr ? "rtl" : "ltr");
    body.classList.toggle("lang-ar", isAr);
    body.classList.toggle("lang-en", !isAr);

    // تبديل عنوان الصفحة والوصف (SEO/UX)
    const titleEl = document.querySelector("title");
    if (titleEl) {
      const t = isAr ? titleEl.getAttribute("data-title-ar") : titleEl.getAttribute("data-title-en");
      if (t) titleEl.textContent = t;
    }
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      const d = isAr ? descEl.getAttribute("data-desc-ar") : descEl.getAttribute("data-desc-en");
      if (d) descEl.setAttribute("content", d);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      const t = isAr ? ogTitle.getAttribute("data-og-title-ar") : ogTitle.getAttribute("data-og-title-en");
      if (t) ogTitle.setAttribute("content", t);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      const d = isAr ? ogDesc.getAttribute("data-og-desc-ar") : ogDesc.getAttribute("data-og-desc-en");
      if (d) ogDesc.setAttribute("content", d);
    }

    // تعبئة نصوص select (option) حسب اللغة
    document.querySelectorAll("option[data-ar]").forEach(function (opt) {
      opt.textContent = isAr ? opt.getAttribute("data-ar") : opt.getAttribute("data-en");
    });

    localStorage.setItem("lw_lang", lang);
  }

  function getInitialLanguage() {
    const saved = localStorage.getItem("lw_lang");
    if (saved === "ar" || saved === "en") return saved;
    return "ar"; // العربية هي اللغة الافتراضية
  }

  applyLanguage(getInitialLanguage());

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      const current = body.classList.contains("lang-ar") ? "ar" : "en";
      applyLanguage(current === "ar" ? "en" : "ar");
    });
  }

  /* ============================================================
     2) تعبئة أرقام الهاتف/واتساب من المتغيرات في كل عناصر الموقع
     (يسمح بتغيير الرقم من مكان واحد أعلى الملف)
     ============================================================ */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.setAttribute("href", "tel:" + CLINIC_PHONE_LOCAL);
  });
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
    const existing = a.getAttribute("href");
    // لا نلمس الروابط التي قد تحتوي رسالة مخصصة لاحقًا
    if (!existing.includes("text=")) {
      a.setAttribute("href", "https://wa.me/" + CLINIC_WHATSAPP_INTL);
    }
  });

  /* ============================================================
     3) نموذج حجز الموعد → فتح واتساب برسالة معبأة تلقائيًا
     ============================================================ */
  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!bookingForm.checkValidity()) {
        e.stopPropagation();
        bookingForm.classList.add("was-validated");
        const firstInvalid = bookingForm.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const isAr = body.classList.contains("lang-ar");

      const name = document.getElementById("bkName").value.trim();
      const phone = document.getElementById("bkPhone").value.trim();
      const serviceSelect = document.getElementById("bkService");
      const service = serviceSelect.options[serviceSelect.selectedIndex]
        ? serviceSelect.options[serviceSelect.selectedIndex].text
        : "";
      const date = document.getElementById("bkDate").value;
      const time = document.getElementById("bkTime").value;
      const genderSelect = document.getElementById("bkGender");
      const gender = genderSelect.options[genderSelect.selectedIndex]
        ? genderSelect.options[genderSelect.selectedIndex].text
        : "";
      const notes = document.getElementById("bkNotes").value.trim();

      let message;
      if (isAr) {
        message =
          `مرحبًا ${CLINIC_NAME_AR} 👋\n` +
          `أرغب في حجز موعد بالتفاصيل التالية:\n\n` +
          `👤 الاسم: ${name}\n` +
          `📱 الجوال: ${phone}\n` +
          `🩺 الخدمة: ${service}\n` +
          `📅 التاريخ المفضل: ${date}\n` +
          `⏰ الوقت المفضل: ${time}\n` +
          `⚧ الجنس: ${gender}` +
          (notes ? `\n📝 ملاحظات: ${notes}` : "");
      } else {
        message =
          `Hello ${CLINIC_NAME_EN} 👋\n` +
          `I would like to book an appointment with the following details:\n\n` +
          `👤 Name: ${name}\n` +
          `📱 Phone: ${phone}\n` +
          `🩺 Service: ${service}\n` +
          `📅 Preferred date: ${date}\n` +
          `⏰ Preferred time: ${time}\n` +
          `⚧ Gender: ${gender}` +
          (notes ? `\n📝 Notes: ${notes}` : "");
      }

      const waUrl = "https://wa.me/" + CLINIC_WHATSAPP_INTL + "?text=" + encodeURIComponent(message);
      window.open(waUrl, "_blank", "noopener");

      bookingForm.reset();
      bookingForm.classList.remove("was-validated");
    });

    // منع اختيار تاريخ في الماضي
    const dateInput = document.getElementById("bkDate");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }
  }

  /* ============================================================
     4) الـ Navbar: تصغير عند التمرير + تفعيل الرابط النشط
     ============================================================ */
  const navbar = document.getElementById("mainNavbar");
  const topBar = document.getElementById("topBar");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  function onScroll() {
    const scrolled = window.scrollY > 40;
    if (navbar) navbar.classList.toggle("scrolled", scrolled);
    if (topBar) topBar.classList.toggle("hide", scrolled);

    // زر العودة للأعلى
    if (backToTop) backToTop.classList.toggle("show", window.scrollY > 500);

    // تمييز الرابط النشط حسب موضع السكرول
    let currentId = "";
    sections.forEach(function (sec) {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) currentId = sec.getAttribute("id");
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active-link", link.getAttribute("href") === "#" + currentId);
    });
  }

  /* ============================================================
     5) زر العودة إلى الأعلى + التمرير السلس
     ============================================================ */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // إغلاق قائمة الجوال المنسدلة عند الضغط على أي رابط
  document.querySelectorAll(".navbar-nav .nav-link, .nav-actions a").forEach(function (link) {
    link.addEventListener("click", function () {
      const collapseEl = document.getElementById("navbarMain");
      if (collapseEl && collapseEl.classList.contains("show") && window.bootstrap) {
        const collapse = window.bootstrap.Collapse.getOrCreateInstance(collapseEl);
        collapse.hide();
      }
    });
  });

  /* ============================================================
     6) Scroll Reveal Animations (IntersectionObserver)
     ============================================================ */
  const revealEls = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ============================================================
     7) عداد الإحصائيات المتحركة (About section)
     ============================================================ */
  const statNums = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window && statNums.length) {
    const statIO = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(function (el) {
      statIO.observe(el);
    });
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const duration = 1400;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  }

  /* ============================================================
     8) سنة الفوتر التلقائية
     ============================================================ */
  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     9) شاشة التحميل (Preloader) — تبقى ثانيتين على الأقل قبل إخفائها
     ============================================================ */
  const preloader = document.getElementById("preloader");
  if (preloader) {
    const MIN_DISPLAY_MS = 2000;
    const startTime = Date.now();
    document.body.style.overflow = "hidden";

    function hidePreloader() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0);
      setTimeout(function () {
        preloader.classList.add("preloader-hide");
        document.body.style.overflow = "";
        setTimeout(function () {
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 600);
      }, remaining);
    }

    if (document.readyState === "complete") {
      hidePreloader();
    } else {
      window.addEventListener("load", hidePreloader);
      // شبكة اتصال بطيئة: لا تُبقي الزائر منتظرًا أكثر من اللازم
      setTimeout(hidePreloader, 6000);
    }
  }
})();
