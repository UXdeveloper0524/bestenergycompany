// =====================================
        // Utility Functions
    // =====================================
    const Utils = {
        debounce(func, wait = 300) {
            let timeout;
            return(...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },
        throttle(func, limit = 200) {
            let inThrottle;
            return(...args) => {
                if (! inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => (inThrottle = false), limit);
                }
            };
        }
    };


    // =====================================
// Universal Dynamic Swiper
// =====================================
$.fn.dynamicSwiper = function () {

    return this.each(function () {

        const el = this;
        const $el = $(el);

        // ----------------------------
        // HARD SAFETY CHECKS
        // ----------------------------

        if (!el) return;
        if (!el.classList.contains('swiper')) return;
        if (!el.querySelector('.swiper-wrapper')) return;
        if (el.swiper) return;

        // ----------------------------
        // Helpers
        // ----------------------------

        const getData = (key, fallback) => {
            const val = $el.data(key);
            return val !== undefined ? val : fallback;
        };

        const num = (v, f) => {
            const n = parseFloat(v);
            return isNaN(n) ? f : n;
        };

        const bool = (v, f) => {
            if (v === undefined) return f;
            if (typeof v === "boolean") return v;
            return ["true", "1"].includes(String(v).toLowerCase());
        };

        // ✅ NEW: handle "auto"
        const parseSlides = (v, fallback) => {
            if (v === "auto") return "auto";
            const n = parseFloat(v);
            return isNaN(n) ? fallback : n;
        };

        // ----------------------------
        // Base Config
        // ----------------------------

        const swiperId = getData("swiper-id", null);

        // ✅ FIX: safe effect fallback
        let effect = getData("effect", "slide");
        if (!effect || effect === "") effect = "slide";

        const base = {
            slidesPerView: parseSlides(getData("items", 1), 1),
            loop: bool(getData("loop", false), false),
            centeredSlides: bool(getData("center", false), false),
            spaceBetween: num(getData("space", 0), 0),
            speed: num(getData("speed", 600), 600),
            effect: effect,
            breakpoints: {
                0: {
                    slidesPerView: parseSlides(getData("items-mobile", 1), 1)
                },
                768: {
                    slidesPerView: parseSlides(getData("items-tab", 1), 1)
                },
                1024: {
                    slidesPerView: parseSlides(getData("items-desktop", 1), 1)
                }
            }
        };

        // ----------------------------
        // EFFECT CONFIG
        // ----------------------------

        if (effect === "fade") {
            base.fadeEffect = {
                crossFade: true
            };
        }

        // ----------------------------
        // AUTO WIDTH SUPPORT
        // ----------------------------

        if (
            base.slidesPerView === "auto" ||
            base.breakpoints[0].slidesPerView === "auto" ||
            base.breakpoints[768].slidesPerView === "auto" ||
            base.breakpoints[1024].slidesPerView === "auto"
        ) {
            base.freeMode = true;
        }

        // ----------------------------
        // AUTOPLAY
        // ----------------------------

        if (bool(getData("autoplay", false), false)) {
            base.autoplay = {
                delay: num(getData("autoplay-timeout", 4000), 4000),
                pauseOnMouseEnter: bool(getData("autoplay-hover-pause", true), true),
                disableOnInteraction: false
            };
        }

        // ----------------------------
        // NAVIGATION
        // ----------------------------

        const hasNav = bool(getData("nav", false), false);

        if (hasNav) {

            let nextEl = null;
            let prevEl = null;

            if (swiperId) {
                nextEl = document.querySelector(`.swiper-button-next[data-nav-id="${swiperId}"]`);
                prevEl = document.querySelector(`.swiper-button-prev[data-nav-id="${swiperId}"]`);
            } else {
                nextEl = $el.find(".swiper-button-next")[0] || null;
                prevEl = $el.find(".swiper-button-prev")[0] || null;
            }

            if (nextEl instanceof Element && prevEl instanceof Element) {

                base.navigation = {
                    nextEl,
                    prevEl
                };

                const prevImg = getData("nav-img-prev", null);
                const nextImg = getData("nav-img-next", null);

                if (prevImg) prevEl.innerHTML = `<img src="${prevImg}" alt="Prev">`;
                if (nextImg) nextEl.innerHTML = `<img src="${nextImg}" alt="Next">`;
            }
        }

        // ----------------------------
        // PAGINATION
        // ----------------------------

        const dotsDefault = bool(getData("dots", false), false);
        const dotsMobile = bool(getData("dots-mobile", dotsDefault), dotsDefault);
        const dotsTab = bool(getData("dots-tab", dotsDefault), dotsDefault);
        const dotsDesktop = bool(getData("dots-desktop", dotsDefault), dotsDefault);

        let paginationEl = null;

        if (swiperId) {
            paginationEl = document.querySelector(`.swiper-pagination[data-pagination-id="${swiperId}"]`);
        } else {
            paginationEl = $el.find(".swiper-pagination")[0] || null;
        }

        if (paginationEl instanceof Element) {

            if (dotsMobile || dotsTab || dotsDesktop) {
                base.pagination = {
                    el: paginationEl,
                    clickable: true,
                    dynamicBullets: false
                };
            }

            base.breakpoints[0].pagination = dotsMobile ? {
                el: paginationEl,
                clickable: true
            } : false;

            base.breakpoints[768].pagination = dotsTab ? {
                el: paginationEl,
                clickable: true
            } : false;

            base.breakpoints[1024].pagination = dotsDesktop ? {
                el: paginationEl,
                clickable: true
            } : false;
        }

     // ----------------------------
// INIT SWIPER (FIXED LOOP)
// ----------------------------

try {

    const slides = el.querySelectorAll('.swiper-slide');
    const slidesCount = slides.length;

    // ----------------------------
    // LOOP FIX LOGIC
    // ----------------------------

    if (base.loop) {

        // get MAX slidesPerView across breakpoints
        const bpValues = [
            base.slidesPerView,
            base.breakpoints[0]?.slidesPerView,
            base.breakpoints[768]?.slidesPerView,
            base.breakpoints[1024]?.slidesPerView
        ];

        // convert "auto" to 1 for safety
        const maxSlidesPerView = Math.ceil(
            Math.max(...bpValues.map(v => v === "auto" ? 1 : Number(v) || 1))
        );

        // ❌ Not enough slides → disable loop
        if (slidesCount <= maxSlidesPerView) {
            base.loop = false;
        } 
        else {
            // ✅ Proper loop setup
            base.loopedSlides = slidesCount;
            base.loopAdditionalSlides = slidesCount;
        }

        // ❗ Fix conflicts
        base.centeredSlides = false;
        base.freeMode = false;
    }

    // ----------------------------
    // OBSERVER FIX (important)
    // ----------------------------

    base.observer = true;
    base.observeParents = true;

    // ----------------------------
    // INIT
    // ----------------------------

    const swiper = new Swiper(el, base);

    swiper.on('slideChangeTransitionEnd', () => {
        document.dispatchEvent(new Event('swiperSlideChange'));
    });

} catch (err) {
    console.warn("Swiper init failed:", err, el);
}

    });
};



// =====================================
// Counter Animation
// =====================================
class CounterAnimation {
    constructor(selector = "#statsSection") {
        this.$section = $(selector);
        if (!this.$section.length) return;

        this.isAnimating = false;
        $(window).on("scroll", Utils.throttle(() => this.checkScroll(), 100));
        this.checkScroll();
    }

    formatNumber(num, suffix) {
        const formats = {
            "M+": () => `${(num / 1e6).toFixed(0)}M+`,
            "K+": () => `${(num / 1e3).toFixed(0)}K+`,
            "%": () => `${num}%`,
            "+": () => `${num}+`,
        };
        return formats[suffix]?.() || num;
    }

    animateCounter($el, target, duration = 3000) {
        const step = target / (duration / 16);
        const suffix = $el.data("suffix") || "";
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                $el.text(this.formatNumber(target, suffix));
                clearInterval(timer);
            } else {
                $el.text(this.formatNumber(Math.floor(current), suffix));
            }
        }, 16);
    }

    isInViewport() {
        const scrollTop = $(window).scrollTop();
        const winHeight = $(window).height();
        const offsetTop = this.$section.offset().top;
        const elHeight = this.$section.outerHeight();

        return (
            scrollTop + winHeight > offsetTop + elHeight * 0.5 &&
            scrollTop < offsetTop + elHeight
        );
    }

    checkScroll() {
        if (this.isInViewport() && !this.isAnimating) {
            this.isAnimating = true;
            $(".counter").each((_, el) => {
                const $el = $(el);
                const target = parseInt($el.data("target"));
                this.animateCounter($el, target);
            });
            setTimeout(() => (this.isAnimating = false), 2100);
        }
    }
}



// =====================================
// Mobile Accordion Controller
// =====================================
class MobileAccordion {
    static initAll() {
        document
            .querySelectorAll('[data-accordion]')
            .forEach(acc => {
                if (!acc._accordionInstance) {
                    acc._accordionInstance = new MobileAccordion(acc);
                }
            });
    }

    constructor(accordion) {
        this.accordion = accordion;
        this.item = accordion.dataset.item || '.accordionItem';
        this.head = accordion.dataset.head || '.accordionHead';
        this.body = accordion.dataset.body || '.accordionBody';
        this.activeClass = accordion.dataset.activeClass || 'active';
        this.breakpoint = parseInt(accordion.dataset.breakpoint || 768, 10);

        this.handleClick = this.handleClick.bind(this);
        this.handleResize = this.handleResize.bind(this);

        this.bind();
        this.update();
    }

    isMobile() {
        return window.innerWidth <= this.breakpoint;
    }

    update() {
        if (!this.isMobile()) {
            this.accordion
                .querySelectorAll(this.item)
                .forEach(item => {
                    item.classList.add(this.activeClass);
                    item.querySelector(this.body).style.maxHeight = '';
                });
            return;
        }

        this.closeAll();
        const first = this.accordion.querySelector(this.item);
        if (first) this.open(first);
    }

    open(item) {
        this.closeAll();
        const body = item.querySelector(this.body);
        item.classList.add(this.activeClass);
        body.style.maxHeight = body.scrollHeight + 'px';
    }

    close(item) {
        item.classList.remove(this.activeClass);
        item.querySelector(this.body).style.maxHeight = 0;
    }

    closeAll() {
        this.accordion
            .querySelectorAll(this.item)
            .forEach(item => this.close(item));
    }

    handleClick(e) {
        if (!this.isMobile()) return;

        const head = e.target.closest(this.head);
        if (!head || !this.accordion.contains(head)) return;

        const item = head.closest(this.item);
        item.classList.contains(this.activeClass)
            ? this.close(item)
            : this.open(item);
    }

    bind() {
        this.accordion.addEventListener('click', this.handleClick);
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.update();
    }
}



class AnimatedNavbar {
    constructor({ menuBtnId, menuId, navItemSelector, breakpoint = 1024 }) {
      this.menuBtn = document.getElementById(menuBtnId);
      this.menu = document.getElementById(menuId);
      this.navItems = document.querySelectorAll(navItemSelector);
  
      this.breakpoint = breakpoint;
      this.menuOpen = false;
  
      this.init();
    }
  
    isMobile() {
      return window.innerWidth < this.breakpoint;
    }
  
    init() {
      if (!this.menuBtn || !this.menu) return;
  
      this.handleResize();
  
      // Toggle Menu
      this.menuBtn.addEventListener("click", () => {
        if (!this.isMobile()) return;
        this.toggleMenu();
      });
  
      // Nav Item Click
      this.navItems.forEach((item) => {
        item.addEventListener("click", () => {
  
          // Remove active class from all
          this.navItems.forEach((nav) => {
            nav.classList.remove("active");
          });
  
          // Add active class to clicked item
          item.classList.add("active");
  
          // Close mobile menu
          if (this.isMobile()) {
            this.closeMenu();
          }
        });
      });
  
      window.addEventListener("resize", () => this.handleResize());
    }
  
    handleResize() {
      if (this.isMobile()) {
        gsap.set(this.menu, {
          y: -20,
          opacity: 0,
          display: "none"
        });
  
        this.menuOpen = false;
      } else {
        gsap.set(this.menu, { clearProps: "all" });
        this.menu.style.display = "block";
        this.menuOpen = false;
      }
    }
  
    openMenu() {
      this.menu.style.display = "block";
  
      gsap.to(this.menu, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      });
  
      gsap.fromTo(
        this.navItems,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.1
        }
      );
  
      this.menuOpen = true;
    }
  
    closeMenu() {
      gsap.to(this.menu, {
        y: -20,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          this.menu.style.display = "none";
        }
      });
  
      this.menuOpen = false;
    }
  
    toggleMenu() {
      this.menuOpen ? this.closeMenu() : this.openMenu();
    }
  }



/* ------------------------------
   Generic Plugin Initializer
---------------------------------*/
function initPlugin(selector, pluginName, options = null) {
    if ($.fn[pluginName]) {
        $(selector)[pluginName](options);
    }
}




$(function () {
    initPlugin(".js-swiper", "dynamicSwiper");

});
class FooterUtils {
    static setCurrentYear() {
        const yearEl = document.getElementById("currentYear");
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    FooterUtils.setCurrentYear();
    MobileAccordion.initAll();
    new AnimatedNavbar({
        menuBtnId: "menuBtn",
        menuId: "menu",
        navItemSelector: ".nav-item"
      });
    
});


$(document).ready(function () {

     new CounterAnimation();
});

