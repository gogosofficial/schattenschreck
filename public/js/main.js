(function () {
"use strict";

if (window.__schattenschreckInitialized) return;
window.__schattenschreckInitialized = true;

/* =====================================================
   GALERIE-BILDER (HIER JEDERZEIT LEICHT AUSTAUSCHEN / ERGÄNZEN)
   Pro Jahr: label (Tab-Text), note (Hinweis-Badge, optional), images (Direktlinks)
   Neue Jahre einfach als weiteren Eintrag ergänzen – Tabs entstehen automatisch.
===================================================== */

const GALLERY_DATA = {
    "2026": {
label: "2026 (Neu)",
note: "Neue Bilder von 2026 veröffentlicht",
images: [
    "https://i.postimg.cc/xCMJLHVp/cc17fa3e-35fb-4310-9fe8-15f0932d45dd.jpg",
    "https://i.postimg.cc/sxzBmXVP/3b1feca0-a4be-493c-9076-ead6d1f5907f.jpg",
    "https://i.postimg.cc/L85JNGMs/9BA880C8-B368-4FEB-BAEE-9E7D55730D4C.jpg",
    "https://i.postimg.cc/DwN8D5vK/0443c57a-508a-423e-8569-7730d2e4db34.jpg",
    "https://i.postimg.cc/jjJLrN2R/179ad8ca-8a01-431f-a3d1-75897a39023c.jpg"
]
    },
    "2025": {
label: "2025",
note: "",
images: [
    "https://i.postimg.cc/xTSGpfsd/bb1280a1-d39a-4212-8d84-2b3bd39a261c.jpg",
    "https://i.postimg.cc/pXYfgw4V/d1cb3507-c40e-4e3f-b9b7-2abd1b99dba8.jpg",
    "https://i.postimg.cc/3xtgwg3Z/794CB09D-517C-403F-9F67-827CCBA50B43.jpg",
    "https://i.postimg.cc/KzMLQwB5/06316b00-5694-43e7-93a5-beeee5556b09.jpg",
    "https://i.postimg.cc/2jnhWpzR/f1afada9-6013-49ee-89bf-539dc262dd9b.jpg"
]
    },
    "2024": {
label: "2024",
note: "",
images: [
    "https://i.postimg.cc/RhJts8tg/4e0b1d45-34f1-43ae-8ffb-659ebc88d4de.jpg",
    "https://i.postimg.cc/TwF03nJX/53fb4270-8bde-4cd0-b30a-74afaf763f42.jpg",
    "https://i.postimg.cc/3r09bbYs/0175b7e3-0579-4aab-b2e4-66991303144e.jpg",
    "https://i.postimg.cc/m2xVxNr2/2df6dc38-6b0a-461e-a585-451f0a8bf5b3.jpg",
    "https://i.postimg.cc/P5CqmZm1/571223d4-52b7-410f-ac57-3b22a27a8998.jpg"
]
    },
    "2023": {
label: "2023",
note: "",
images: [
    "https://i.postimg.cc/T3cp2GJP/37b77913-a662-454a-8ece-0a780045ec77.jpg",
    "https://i.postimg.cc/y8KDzW9M/50154b5b-e8f0-4158-bf1d-8470c21de5b0.jpg",
    "https://i.postimg.cc/qB9tj1vY/24059b0f-2805-4356-8de4-13897438377a.jpg"
]
    }
};

/* =====================================================
   ZENTRALE KONFIGURATION (EVENT & INTRO-FEINABSTIMMUNG)
===================================================== */

const EVENT_CONFIG = {
    startIso: "2027-10-31T18:00:00+01:00",
    lastEntryIso: "2027-10-31T20:00:00+01:00"
};

const INTRO_CONFIG = {
    sessionKey: "schattenschreck_intro_seen_2027",
    forceAlwaysShowInDev: false, // Bei Bedarf synchron mit FORCE_DEV_INTRO im <head> auf true setzen

    // Benötigte virtuelle Scrollstrecke (Mausrad / Trackpad) in normalisierten Pixeln
    wheelDistancePx: 540,
    maxSingleWheelStepPx: 115,

    // Benötigte vertikale Wischstrecke auf Touchscreens (ca. 38% der Viewporthöhe, geklemmt auf 210–340px)
    touchViewportRatio: 0.38,
    minTouchDistancePx: 210,
    maxTouchDistancePx: 340,

    // Rückgleiten vs. automatisches Vollenden nach regulärem Finger-Loslassen (touchend)
    touchCommitThreshold: 0.62,

    // Animationsphasen (0.0 bis 1.0)
    phaseLeadInEnd: 0.14,
    phaseCurtainEnd: 0.78,

    // Glättung der Bewegung
    smoothingFactor: 0.16
};

const docEl = document.documentElement;
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reduceMotion = motionQuery.matches;

const header = document.getElementById("header");
const mainElement = document.getElementById("top");
const footerElement = document.getElementById("footer");
const cookieBanner = document.getElementById("cookieBanner");
const backTop = document.getElementById("backTop");
const heroSection = document.getElementById("mainContent");

motionQuery.addEventListener("change", (event) => {
    reduceMotion = event.matches;
});

/* =====================================================
   HILFSFUNKTIONEN FÜR SCROLL-LOCK & HINTERGRUND-INERT
===================================================== */

const supportsScrollbarGutter =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("scrollbar-gutter: stable");

function updateScrollbarCompensation(lock) {
    if (lock) {
if (!supportsScrollbarGutter) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
        docEl.style.setProperty(
            "--modal-padding-compensation",
            `${scrollbarWidth}px`
        );
    }
}
document.body.classList.add("overlay-locked");
    } else {
document.body.classList.remove("overlay-locked");
docEl.style.setProperty("--modal-padding-compensation", "0px");
    }
}

function setElementInert(el, value) {
    if (!el) return;
    if (value) {
el.setAttribute("inert", "");
el.setAttribute("aria-hidden", "true");
    } else {
el.removeAttribute("inert");
el.removeAttribute("aria-hidden");
    }

    // Der Cookie-Banner liegt außerhalb von Header/Main/Footer und folgt dem Footer
    if (el === footerElement && cookieBanner) {
if (value) {
    cookieBanner.setAttribute("inert", "");
    cookieBanner.setAttribute("aria-hidden", "true");
} else {
    cookieBanner.removeAttribute("inert");
    cookieBanner.removeAttribute("aria-hidden");
}
    }
}

function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(
container.querySelectorAll(
    'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
)
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function invLerp(a, b, v) {
    if (a === b) return 0;
    return clamp((v - a) / (b - a), 0, 1);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* =====================================================
   1. FORTSCHRITTSBASIERTES CINEMATIC INTRO
===================================================== */

let abortIntroSafely = null;

function initIntro() {
    const introScreen = document.getElementById("introScreen");
    const introSkipButton = document.getElementById("introSkipButton");

    if (!introScreen || !introSkipButton) {
docEl.classList.remove("intro-pending");
document.body.classList.remove("intro-active");
return;
    }

    let hasSeenIntro = false;
    if (!INTRO_CONFIG.forceAlwaysShowInDev) {
try {
    hasSeenIntro = window.sessionStorage.getItem(INTRO_CONFIG.sessionKey) === "1";
} catch (_) {
    hasSeenIntro = false;
}
    }

    const hasHash = Boolean(window.location.hash && window.location.hash !== "#");
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const wasPreparedInHead = docEl.classList.contains("intro-pending");

    if (
motionQuery.matches ||
hasSeenIntro ||
hasHash ||
currentScrollY > 10 ||
(!wasPreparedInHead && !INTRO_CONFIG.forceAlwaysShowInDev)
    ) {
docEl.classList.remove("intro-pending");
document.body.classList.remove("intro-active");
introScreen.hidden = true;
return;
    }

    // Zustände: "active" | "completing" | "completed"
    let state = "active";
    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = null;
    const startedAtTop = (window.scrollY || window.pageYOffset || 0) <= 10;

    // Touch-Tracking-Variablen (pro Geste konstant gehalten)
    let activeTouchId = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartProgress = 0;
    let currentGestureFullDistancePx = INTRO_CONFIG.minTouchDistancePx;
    let isHorizontalGesture = false;

    introScreen.hidden = false;
    document.body.classList.add("intro-active");
    docEl.classList.remove("intro-pending");

    setElementInert(header, true);
    setElementInert(mainElement, true);
    setElementInert(footerElement, true);

    function computeTouchFullDistancePx() {
const vhDistance = window.innerHeight * INTRO_CONFIG.touchViewportRatio;
return clamp(
    vhDistance,
    INTRO_CONFIG.minTouchDistancePx,
    INTRO_CONFIG.maxTouchDistancePx
);
    }

    function applyVisualProgress(p) {
const pLead = INTRO_CONFIG.phaseLeadInEnd;
const pCurtain = INTRO_CONFIG.phaseCurtainEnd;

const phase1 = invLerp(0, pLead, p);
const phase2 = easeInOutQuad(invLerp(pLead, pCurtain, p));
const phase3 = easeOutCubic(invLerp(pCurtain, 1, p));

const logoScale = 1 - (0.015 * phase1) - (0.115 * phase2) - (0.05 * phase3);
const logoY = -(6 * phase1) - (38 * phase2) - (26 * phase3);
const logoOpacity = 1 - (0.15 * phase2) - (0.85 * phase3);

const glowScale = 1 + (0.12 * phase1) + (0.18 * phase2);
const glowOpacity = 0.65 + (0.25 * phase1) - (0.55 * phase2) - (0.35 * phase3);

const bgOpacity = 1 - (0.22 * phase2) - (0.78 * phase3);

// Hinweis & Fortschrittsbalken treten zurück, Skip-Button bleibt bis Phase 3 klar sichtbar
const hintFade = clamp(invLerp(0.08, 0.62, p), 0, 1);
const hintOpacity = 1 - hintFade;
const hintY = 10 * hintFade;
const skipOpacity = 1 - (0.85 * phase3);

introScreen.style.setProperty("--intro-progress", p.toFixed(4));
introScreen.style.setProperty("--intro-logo-scale", logoScale.toFixed(4));
introScreen.style.setProperty("--intro-logo-y", `${logoY.toFixed(2)}px`);
introScreen.style.setProperty("--intro-logo-opacity", clamp(logoOpacity, 0, 1).toFixed(4));
introScreen.style.setProperty("--intro-glow-scale", glowScale.toFixed(4));
introScreen.style.setProperty("--intro-glow-opacity", clamp(glowOpacity, 0, 1).toFixed(4));
introScreen.style.setProperty("--intro-bg-opacity", clamp(bgOpacity, 0, 1).toFixed(4));
introScreen.style.setProperty("--intro-hint-opacity", hintOpacity.toFixed(4));
introScreen.style.setProperty("--intro-hint-y", `${hintY.toFixed(2)}px`);
introScreen.style.setProperty("--intro-skip-opacity", clamp(skipOpacity, 0.15, 1).toFixed(4));
    }

    function ensureAnimationLoop() {
if (rafId !== null || state === "completed") return;
rafId = window.requestAnimationFrame(stepAnimation);
    }

    function stepAnimation() {
rafId = null;
if (state === "completed") return;

const diff = targetProgress - currentProgress;
if (Math.abs(diff) > 0.0015) {
    currentProgress += diff * INTRO_CONFIG.smoothingFactor;
} else {
    currentProgress = targetProgress;
}

applyVisualProgress(currentProgress);

if (targetProgress >= 1 && currentProgress >= 0.992) {
    completeIntro(false, true);
    return;
}

if (Math.abs(targetProgress - currentProgress) > 0.0015 || state === "completing") {
    ensureAnimationLoop();
}
    }

    function cleanupIntroListeners() {
window.removeEventListener("wheel", onWheel);
window.removeEventListener("touchstart", onTouchStart);
window.removeEventListener("touchmove", onTouchMove);
window.removeEventListener("touchend", onTouchEnd);
window.removeEventListener("touchcancel", onTouchCancel);
window.removeEventListener("keydown", onKeyDown);
window.removeEventListener("scroll", onUnexpectedScrollRestore);
motionQuery.removeEventListener("change", onMotionPreferenceChange);
    }

    function completeIntro(moveFocusToHero, markAsSeen) {
if (state === "completed") return;
state = "completed";

if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
}

cleanupIntroListeners();

if (markAsSeen) {
    try {
        window.sessionStorage.setItem(INTRO_CONFIG.sessionKey, "1");
    } catch (_) {
        // SessionStorage optional
    }
}

const focusWasInsideIntro = introScreen.contains(document.activeElement);

docEl.classList.remove("intro-pending");
document.body.classList.remove("intro-active");
setElementInert(header, false);
setElementInert(mainElement, false);
setElementInert(footerElement, false);
introScreen.hidden = true;

// Nur wenn das Intro wirklich am Seitenanfang gestartet wurde, evtl. minimalen Drift sofort korrigieren
const currentY = window.scrollY || window.pageYOffset || 0;
if (startedAtTop && currentY > 0 && currentY < 120 && markAsSeen) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

if ((moveFocusToHero || focusWasInsideIntro) && heroSection) {
    heroSection.focus({ preventScroll: true });
}
    }

    abortIntroSafely = () => {
completeIntro(false, false);
    };

    // Falls der Browser nach Script-Start noch eine gespeicherte tiefere Scrollposition wiederherstellt:
    // Intro sofort lautlos freigeben, ohne an den Seitenanfang zu springen.
    function onUnexpectedScrollRestore() {
if (state === "completed") return;
const y = window.scrollY || window.pageYOffset || 0;
if (y > 40) {
    completeIntro(false, false);
}
    }

    function normalizeWheelDelta(event) {
let deltaY = event.deltaY;
if (event.deltaMode === 1) {
    deltaY *= 24;
} else if (event.deltaMode === 2) {
    deltaY *= window.innerHeight * 0.85;
}
return clamp(
    deltaY,
    -INTRO_CONFIG.maxSingleWheelStepPx,
    INTRO_CONFIG.maxSingleWheelStepPx
);
    }

    function onWheel(event) {
if (state !== "active") return;
if (event.ctrlKey || event.metaKey) return;
if (Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.3) return;

const deltaPx = normalizeWheelDelta(event);
if (Math.abs(deltaPx) < 0.5) return;

targetProgress = clamp(
    targetProgress + deltaPx / INTRO_CONFIG.wheelDistancePx,
    0,
    1
);

if (targetProgress >= 1) {
    state = "completing";
}

ensureAnimationLoop();
    }

    function onTouchStart(event) {
if (state !== "active") return;

if (event.touches.length !== 1) {
    activeTouchId = null;
    return;
}

const touch = event.touches[0];
activeTouchId = touch.identifier;
touchStartX = touch.clientX;
touchStartY = touch.clientY;
touchStartProgress = targetProgress;
// Strecke einmalig beim Start der Geste berechnen (stabil gegen Browserleisten-Resize)
currentGestureFullDistancePx = computeTouchFullDistancePx();
isHorizontalGesture = false;
    }

    function onTouchMove(event) {
if (state !== "active" || activeTouchId === null) return;
if (event.touches.length !== 1) return;

const touch = event.touches[0];
if (touch.identifier !== activeTouchId) return;

const deltaX = touchStartX - touch.clientX;
const deltaY = touchStartY - touch.clientY;

if (!isHorizontalGesture && Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && Math.abs(deltaX) > 12) {
    isHorizontalGesture = true;
}
if (isHorizontalGesture) return;

targetProgress = clamp(
    touchStartProgress + deltaY / currentGestureFullDistancePx,
    0,
    1
);

if (targetProgress >= 1) {
    state = "completing";
}

ensureAnimationLoop();
    }

    function onTouchEnd(event) {
if (activeTouchId === null) return;

const endedTouch = Array.from(event.changedTouches || []).find(
    (t) => t.identifier === activeTouchId
);
if (!endedTouch && event.touches && event.touches.length > 0) return;

activeTouchId = null;
if (state !== "active") return;

if (targetProgress >= INTRO_CONFIG.touchCommitThreshold) {
    targetProgress = 1;
    state = "completing";
} else {
    targetProgress = 0;
}
ensureAnimationLoop();
    }

    // Abgebrochene Geste (touchcancel) bestätigt niemals automatisch das Intro
    function onTouchCancel() {
if (activeTouchId === null) return;
activeTouchId = null;

if (state === "completing") {
    state = "active";
}
if (state === "active") {
    targetProgress = 0;
    ensureAnimationLoop();
}
    }

    function onKeyDown(event) {
if (state !== "active" && state !== "completing") return;

if (event.key === "Escape") {
    event.preventDefault();
    completeIntro(true, true);
    return;
}

if (event.key === "Tab") {
    event.preventDefault();
    introSkipButton.focus();
    return;
}

if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
    if (document.activeElement === introSkipButton && event.key === " ") {
        return;
    }
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 0.28 : 0.55;
    targetProgress = clamp(targetProgress + step, 0, 1);
    if (targetProgress >= 1) {
        state = "completing";
    }
    ensureAnimationLoop();
} else if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    targetProgress = clamp(targetProgress - 0.28, 0, 1);
    ensureAnimationLoop();
}
    }

    function onMotionPreferenceChange(event) {
if (event.matches && state !== "completed") {
    completeIntro(false, true);
}
    }

    introSkipButton.addEventListener("click", () => {
completeIntro(true, true);
    });

    applyVisualProgress(0);

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onUnexpectedScrollRestore, { passive: true });
    motionQuery.addEventListener("change", onMotionPreferenceChange);
}

/* =====================================================
   2. MOBILE NAVIGATION & IMPRESSUM DIALOG KOORDINATION
===================================================== */

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuBackground = document.getElementById("mobileMenuBackground");

const impressumButton = document.getElementById("impressumButton");
const impressumModal = document.getElementById("impressumModal");
const modalClose = document.getElementById("modalClose");

const datenschutzButton = document.getElementById("datenschutzButton");
const datenschutzModal = document.getElementById("datenschutzModal");
const datenschutzClose = document.getElementById("datenschutzClose");

let isMenuOpen = false;
let isModalOpen = false;
let lastModalTrigger = null;
let modalFocusTimer = null;
let isDatenschutzOpen = false;
let lastDatenschutzTrigger = null;
let datenschutzFocusTimer = null;

/* ---- Galerie-Overlay: Elemente & Zustand ---- */
const galleryModal = document.getElementById("galleryModal");
const galleryClose = document.getElementById("galleryClose");
const galleryTabsEl = document.getElementById("galleryTabs");
const galleryNoteEl = document.getElementById("galleryNote");
const galleryNoteTextEl = document.getElementById("galleryNoteText");
const galleryStageEl = document.getElementById("galleryStage");
const galleryImageEl = document.getElementById("galleryImage");
const galleryPrevBtn = document.getElementById("galleryPrev");
const galleryNextBtn = document.getElementById("galleryNext");
const galleryCounterNumEl = document.getElementById("galleryCounterNum");
const galleryCounterYearEl = document.getElementById("galleryCounterYear");
const galleryDownloadEl = document.getElementById("galleryDownload");

let isGalleryOpen = false;
let lastGalleryTrigger = null;
let galleryFocusTimer = null;
let galleryYear = null;
let galleryIndex = 0;

// Jahre absteigend (neuestes zuerst); nur Jahre mit mindestens einem Bild
const galleryYears = Object.keys(GALLERY_DATA)
    .filter((year) => GALLERY_DATA[year] && Array.isArray(GALLERY_DATA[year].images) && GALLERY_DATA[year].images.length > 0)
    .sort((a, b) => Number(b) - Number(a));

function openMobileMenu() {
    if (!menuButton || !mobileMenu) return;
    if (isModalOpen) {
closeImpressumModal(false);
    }
    if (isGalleryOpen) {
closeGalleryModal(false);
    }
    if (isDatenschutzOpen) {
closeDatenschutzModal(false);
    }

    isMenuOpen = true;
    mobileMenu.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Menü schließen");

    setElementInert(mainElement, true);
    setElementInert(footerElement, true);
    updateScrollbarCompensation(true);

    const firstLink = mobileMenu.querySelector(".mobile-menu-panel a");
    if (firstLink) {
firstLink.focus();
    }
}

function closeMobileMenu(restoreFocusToButton = true) {
    if (!menuButton || !mobileMenu || !isMenuOpen) return;

    isMenuOpen = false;
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Menü öffnen");

    setElementInert(mainElement, false);
    setElementInert(footerElement, false);
    updateScrollbarCompensation(false);

    if (restoreFocusToButton && window.innerWidth <= 800) {
menuButton.focus();
    }
}

function openImpressumModal(triggerElement) {
    if (!impressumModal || !modalClose) return;
    if (isMenuOpen) {
closeMobileMenu(false);
    }
    if (isGalleryOpen) {
closeGalleryModal(false);
    }
    if (isDatenschutzOpen) {
closeDatenschutzModal(false);
    }

    lastModalTrigger = triggerElement || document.activeElement;
    isModalOpen = true;

    impressumModal.classList.add("open");
    impressumModal.setAttribute("aria-hidden", "false");

    setElementInert(header, true);
    setElementInert(mainElement, true);
    setElementInert(footerElement, true);
    updateScrollbarCompensation(true);

    if (modalFocusTimer) {
window.clearTimeout(modalFocusTimer);
    }
    modalFocusTimer = window.setTimeout(() => {
if (isModalOpen) {
    modalClose.focus();
}
    }, 30);
}

function closeImpressumModal(restoreFocus = true) {
    if (!impressumModal || !isModalOpen) return;

    isModalOpen = false;
    if (modalFocusTimer) {
window.clearTimeout(modalFocusTimer);
modalFocusTimer = null;
    }

    impressumModal.classList.remove("open");
    impressumModal.setAttribute("aria-hidden", "true");

    setElementInert(header, false);
    setElementInert(mainElement, false);
    setElementInert(footerElement, false);
    updateScrollbarCompensation(false);

    if (
restoreFocus &&
lastModalTrigger &&
typeof lastModalTrigger.focus === "function" &&
document.contains(lastModalTrigger) &&
lastModalTrigger.offsetParent !== null
    ) {
lastModalTrigger.focus();
    }
}

/* ---- Datenschutz-Dialog: Logik (analog Impressum) ---- */

function openDatenschutzModal(triggerElement) {
    if (!datenschutzModal || !datenschutzClose) return;
    if (isDatenschutzOpen) return;
    if (isMenuOpen) {
closeMobileMenu(false);
    }
    if (isModalOpen) {
closeImpressumModal(false);
    }
    if (isGalleryOpen) {
closeGalleryModal(false);
    }

    lastDatenschutzTrigger = triggerElement || document.activeElement;
    isDatenschutzOpen = true;

    datenschutzModal.classList.add("open");
    datenschutzModal.setAttribute("aria-hidden", "false");

    setElementInert(header, true);
    setElementInert(mainElement, true);
    setElementInert(footerElement, true);
    updateScrollbarCompensation(true);

    const datenschutzContent = document.getElementById("datenschutzContent");
    if (datenschutzContent) {
datenschutzContent.scrollTop = 0;
    }

    if (datenschutzFocusTimer) {
window.clearTimeout(datenschutzFocusTimer);
    }
    datenschutzFocusTimer = window.setTimeout(() => {
if (isDatenschutzOpen) {
    datenschutzClose.focus();
}
    }, 30);
}

function closeDatenschutzModal(restoreFocus = true) {
    if (!datenschutzModal || !isDatenschutzOpen) return;

    isDatenschutzOpen = false;
    if (datenschutzFocusTimer) {
window.clearTimeout(datenschutzFocusTimer);
datenschutzFocusTimer = null;
    }

    datenschutzModal.classList.remove("open");
    datenschutzModal.setAttribute("aria-hidden", "true");

    setElementInert(header, false);
    setElementInert(mainElement, false);
    setElementInert(footerElement, false);
    updateScrollbarCompensation(false);

    if (
restoreFocus &&
lastDatenschutzTrigger &&
typeof lastDatenschutzTrigger.focus === "function" &&
document.contains(lastDatenschutzTrigger) &&
lastDatenschutzTrigger.offsetParent !== null
    ) {
lastDatenschutzTrigger.focus();
    }
}

/* ---- Galerie-Overlay: Logik ---- */

function pad2(n) {
    return String(n).padStart(2, "0");
}

function renderGalleryTabs() {
    if (!galleryTabsEl) return;
    galleryTabsEl.textContent = "";

    galleryYears.forEach((year) => {
const btn = document.createElement("button");
btn.type = "button";
btn.className = "gallery-tab";
btn.dataset.year = year;
btn.setAttribute("role", "tab");
btn.setAttribute("aria-selected", "false");
btn.textContent = GALLERY_DATA[year].label || year;
btn.addEventListener("click", () => {
    selectGalleryYear(year, 0);
});
galleryTabsEl.appendChild(btn);
    });
}

function updateGalleryTabs() {
    if (!galleryTabsEl) return;
    galleryTabsEl.querySelectorAll(".gallery-tab").forEach((btn) => {
const active = btn.dataset.year === galleryYear;
btn.classList.toggle("is-active", active);
btn.setAttribute("aria-selected", active ? "true" : "false");
    });
}

function showGalleryImage(index) {
    const data = GALLERY_DATA[galleryYear];
    if (!data || !galleryImageEl) return;

    const total = data.images.length;
    galleryIndex = ((index % total) + total) % total;
    const url = data.images[galleryIndex];

    galleryImageEl.alt = `Schattenschreck ${galleryYear} – Bild ${galleryIndex + 1} von ${total}`;

    if (
galleryImageEl.getAttribute("src") === url &&
galleryImageEl.complete &&
galleryImageEl.naturalWidth > 0
    ) {
// Dasselbe Bild ist bereits geladen → direkt sichtbar lassen (kein schwarzes Bild)
galleryImageEl.classList.remove("img-broken");
galleryImageEl.classList.add("is-loaded");
if (galleryStageEl) galleryStageEl.classList.remove("stage-busy");
    } else {
galleryImageEl.classList.remove("img-broken", "is-loaded");
if (galleryStageEl) galleryStageEl.classList.add("stage-busy");
galleryImageEl.onload = () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        galleryImageEl.classList.add("is-loaded");
        if (galleryStageEl) galleryStageEl.classList.remove("stage-busy");
    }));
};
galleryImageEl.onerror = () => {
    galleryImageEl.classList.add("img-broken");
    if (galleryStageEl) galleryStageEl.classList.remove("stage-busy");
};
galleryImageEl.src = url;
    }

    if (galleryCounterNumEl) {
galleryCounterNumEl.textContent = `${pad2(galleryIndex + 1)} / ${pad2(total)}`;
    }
    if (galleryCounterYearEl) {
galleryCounterYearEl.textContent = `Schattenschreck ${galleryYear}`;
    }
    if (galleryDownloadEl) {
galleryDownloadEl.setAttribute("href", url);
    }

    // Nächstes Bild leise vorladen, damit das Durchschalten ohne Wartezeit klappt
    if (total > 1) {
preloadImage(data.images[(galleryIndex + 1) % total]);
    }
}

function selectGalleryYear(year, index) {
    if (!GALLERY_DATA[year] || !GALLERY_DATA[year].images || GALLERY_DATA[year].images.length === 0) {
year = galleryYears[0];
    }
    if (!year) return;

    galleryYear = year;
    updateGalleryTabs();
    preloadGalleryYear(year);

    const note = GALLERY_DATA[year].note;
    if (galleryNoteEl && galleryNoteTextEl) {
galleryNoteTextEl.textContent = note || "";
galleryNoteEl.hidden = !note;
    }

    showGalleryImage(index || 0);
}

/* ---- Preload-Helfer (gemeinsamer Scope für Galerie & Jahres-Preload) ---- */
const preloadCache = new Map();

function canPreload() {
    // Datensparmodus respektieren
    const conn = navigator.connection;
    return !(conn && conn.saveData);
}

function preloadImage(url) {
    if (!url || preloadCache.has(url)) return;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    preloadCache.set(url, img);
}

// Lädt die weiteren Bilder eines Jahres sukzessive im Hintergrund,
// sobald die Galerie geöffnet oder das Jahr ausgewählt wird.
const yearPreloadStarted = {};

function preloadGalleryYear(year) {
    if (yearPreloadStarted[year] || !GALLERY_DATA[year]) return;
    if (!canPreload()) return;
    yearPreloadStarted[year] = true;

    const urls = GALLERY_DATA[year].images.slice();
    let i = 0;

    function loadNext() {
if (i >= urls.length) return;
preloadImage(urls[i++]);
window.setTimeout(loadNext, 180);
    }
    loadNext();
}

function galleryStep(direction) {
    if (!isGalleryOpen || !galleryYear) return;
    showGalleryImage(galleryIndex + direction);
}

function openGalleryModal(year, triggerElement) {
    if (!galleryModal || !galleryClose || galleryYears.length === 0) return;
    if (isMenuOpen) {
closeMobileMenu(false);
    }
    if (isModalOpen) {
closeImpressumModal(false);
    }
    if (isDatenschutzOpen) {
closeDatenschutzModal(false);
    }

    lastGalleryTrigger = triggerElement || document.activeElement;
    isGalleryOpen = true;

    selectGalleryYear(String(year || galleryYears[0]), 0);

    galleryModal.classList.add("open");
    galleryModal.setAttribute("aria-hidden", "false");

    setElementInert(header, true);
    setElementInert(mainElement, true);
    setElementInert(footerElement, true);
    updateScrollbarCompensation(true);

    if (galleryFocusTimer) {
window.clearTimeout(galleryFocusTimer);
    }
    galleryFocusTimer = window.setTimeout(() => {
if (isGalleryOpen) {
    galleryClose.focus();
}
    }, 30);
}

function closeGalleryModal(restoreFocus = true) {
    if (!galleryModal || !isGalleryOpen) return;

    isGalleryOpen = false;
    if (galleryFocusTimer) {
window.clearTimeout(galleryFocusTimer);
galleryFocusTimer = null;
    }

    galleryModal.classList.remove("open");
    galleryModal.setAttribute("aria-hidden", "true");

    setElementInert(header, false);
    setElementInert(mainElement, false);
    setElementInert(footerElement, false);
    updateScrollbarCompensation(false);

    if (
restoreFocus &&
lastGalleryTrigger &&
typeof lastGalleryTrigger.focus === "function" &&
document.contains(lastGalleryTrigger) &&
lastGalleryTrigger.offsetParent !== null
    ) {
lastGalleryTrigger.focus();
    }
}

function initNavigationAndOverlays() {
    if (menuButton && mobileMenu) {
menuButton.addEventListener("click", () => {
    if (isMenuOpen) {
        closeMobileMenu(true);
    } else {
        openMobileMenu();
    }
});

if (mobileMenuBackground) {
    mobileMenuBackground.addEventListener("click", () => {
        closeMobileMenu(true);
    });
}

mobileMenu.querySelectorAll(".mobile-menu-panel a").forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("#")) {
            const target = document.querySelector(href);
            closeMobileMenu(false);
            if (target) {
                event.preventDefault();
                if (history.pushState) {
                    history.pushState(null, "", href);
                } else {
                    window.location.hash = href;
                }
                target.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "start"
                });
                if (!target.hasAttribute("tabindex")) {
                    target.setAttribute("tabindex", "-1");
                }
                target.focus({ preventScroll: true });
            }
        } else {
            closeMobileMenu(false);
        }
    });
});
    }

    if (impressumButton && impressumModal && modalClose) {
impressumModal.setAttribute("role", "dialog");
impressumModal.setAttribute("aria-modal", "true");
impressumModal.setAttribute("aria-hidden", "true");
impressumButton.setAttribute("aria-haspopup", "dialog");
impressumButton.setAttribute("aria-controls", "impressumModal");

impressumButton.addEventListener("click", (event) => {
    event.preventDefault();
    openImpressumModal(impressumButton);
});

modalClose.addEventListener("click", () => {
    closeImpressumModal(true);
});

impressumModal.addEventListener("click", (event) => {
    if (event.target === impressumModal) {
        closeImpressumModal(true);
    }
});

if (window.location.hash === "#impressumModal") {
    openImpressumModal(impressumButton);
}

window.requestAnimationFrame(() => {
    impressumModal.classList.add("transitions-ready");
});
    } else {
docEl.classList.add("modal-failed");
    }

    if (datenschutzButton && datenschutzModal && datenschutzClose) {
datenschutzModal.setAttribute("role", "dialog");
datenschutzModal.setAttribute("aria-modal", "true");
datenschutzModal.setAttribute("aria-hidden", "true");
datenschutzButton.setAttribute("aria-haspopup", "dialog");
datenschutzButton.setAttribute("aria-controls", "datenschutzModal");

datenschutzButton.addEventListener("click", (event) => {
    event.preventDefault();
    openDatenschutzModal(datenschutzButton);
});

datenschutzClose.addEventListener("click", () => {
    closeDatenschutzModal(true);
});

datenschutzModal.addEventListener("click", (event) => {
    if (event.target === datenschutzModal) {
        closeDatenschutzModal(true);
    }
});

if (window.location.hash === "#datenschutzModal") {
    openDatenschutzModal(datenschutzButton);
}

window.requestAnimationFrame(() => {
    datenschutzModal.classList.add("transitions-ready");
});
    } else {
docEl.classList.add("modal-failed");
    }

    document.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
    if (isGalleryOpen) {
        event.preventDefault();
        closeGalleryModal(true);
        return;
    }
    if (isModalOpen) {
        event.preventDefault();
        closeImpressumModal(true);
        return;
    }
    if (isDatenschutzOpen) {
        event.preventDefault();
        closeDatenschutzModal(true);
        return;
    }
    if (isMenuOpen) {
        event.preventDefault();
        closeMobileMenu(true);
        return;
    }
}

if (isGalleryOpen && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    event.preventDefault();
    galleryStep(event.key === "ArrowRight" ? 1 : -1);
    return;
}

if (event.key === "Tab") {
    const activeDialog = isGalleryOpen
        ? galleryModal
        : (isModalOpen ? impressumModal : (isDatenschutzOpen ? datenschutzModal : null));

    if (activeDialog) {
        const focusables = getFocusableElements(activeDialog);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    } else if (isMenuOpen && mobileMenu && menuButton) {
        const panelLinks = getFocusableElements(mobileMenu);
        const focusables = [menuButton, ...panelLinks];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}
    });

    window.addEventListener(
"resize",
() => {
    if (window.innerWidth > 800 && isMenuOpen) {
        closeMobileMenu(false);
    }
},
{ passive: true }
    );
}

/* =====================================================
   2b. GALERIE (OVERLAY-STEUERUNG, TABS, SWIPE, PRELOAD)
===================================================== */

function initGallery() {
    if (
!galleryModal || !galleryClose || !galleryImageEl || !galleryStageEl ||
galleryYears.length === 0
    ) {
return;
    }

    galleryModal.setAttribute("role", "dialog");
    galleryModal.setAttribute("aria-modal", "true");
    galleryModal.setAttribute("aria-hidden", "true");

    renderGalleryTabs();

    // Öffnen über alle Trigger (Danksagung, Teaser-Button, Jahres-Direktwahl)
    document.querySelectorAll("[data-gallery-open]").forEach((btn) => {
btn.setAttribute("aria-haspopup", "dialog");
btn.setAttribute("aria-controls", "galleryModal");
btn.addEventListener("click", (event) => {
    event.preventDefault();
    openGalleryModal(btn.dataset.galleryYear || galleryYears[0], btn);
});
    });

    // Schließen: ×, Klick auf dunklen Hintergrund (Escape siehe globaler Keydown-Handler)
    galleryClose.addEventListener("click", () => {
closeGalleryModal(true);
    });

    galleryModal.addEventListener("click", (event) => {
if (event.target === galleryModal) {
    closeGalleryModal(true);
}
    });

    if (galleryPrevBtn) {
galleryPrevBtn.addEventListener("click", () => galleryStep(-1));
    }
    if (galleryNextBtn) {
galleryNextBtn.addEventListener("click", () => galleryStep(1));
    }

    // Touch-Swipe links/rechts auf der Bildbühne
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeTracking = false;

    galleryStageEl.addEventListener("touchstart", (event) => {
if (event.touches.length !== 1) {
    swipeTracking = false;
    return;
}
swipeTracking = true;
swipeStartX = event.touches[0].clientX;
swipeStartY = event.touches[0].clientY;
    }, { passive: true });

    galleryStageEl.addEventListener("touchend", (event) => {
if (!swipeTracking) return;
swipeTracking = false;

const touch = event.changedTouches && event.changedTouches[0];
if (!touch) return;

const dx = touch.clientX - swipeStartX;
const dy = touch.clientY - swipeStartY;

if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    galleryStep(dx < 0 ? 1 : -1);
}
    }, { passive: true });

    galleryStageEl.addEventListener("touchcancel", () => {
swipeTracking = false;
    }, { passive: true });

    window.requestAnimationFrame(() => {
galleryModal.classList.add("transitions-ready");
    });

    /* ---- Preloading beim Seitenstart: nur das erste Bild von 2026 ----
       Alle weiteren Bilder folgen erst beim Öffnen der Galerie bzw.
       Jahreswechsel (siehe preloadGalleryYear). Die Helfer preloadCache,
       canPreload und preloadImage liegen im äußeren Scope. */
    function startInitialPreload() {
if (!canPreload()) return;
const first = GALLERY_DATA["2026"];
if (first && first.images && first.images.length > 0) {
    preloadImage(first.images[0]);
}
    }

    function schedulePreload() {
if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(startInitialPreload, { timeout: 4000 });
} else {
    window.setTimeout(startInitialPreload, 1500);
}
    }

    if (document.readyState === "complete") {
schedulePreload();
    } else {
window.addEventListener("load", schedulePreload, { once: true });
    }
}

/* =====================================================
   3. COUNTDOWN (OHNE DATUMSWIEDERHOLUNG & OHNE HÖHENSPRUNG)
===================================================== */

function initCountdown() {
    const sectionEl = document.getElementById("countdownSection");
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const statusEl = document.getElementById("countdownStatus");

    if (!sectionEl || !daysEl || !hoursEl || !minutesEl || !secondsEl || !statusEl) {
docEl.classList.add("countdown-failed");
return;
    }

    const startTimeMs = new Date(EVENT_CONFIG.startIso).getTime();
    const lastEntryMs = new Date(EVENT_CONFIG.lastEntryIso).getTime();
    if (Number.isNaN(startTimeMs)) {
docEl.classList.add("countdown-failed");
return;
    }

    const prevValues = {
days: "",
hours: "",
minutes: "",
seconds: "",
status: ""
    };

    function setTextIfChanged(el, key, nextVal) {
if (prevValues[key] !== nextVal) {
    prevValues[key] = nextVal;
    el.textContent = nextVal;
}
    }

    function setStatusMessage(message) {
if (!message) {
    statusEl.hidden = true;
    setTextIfChanged(statusEl, "status", "");
} else {
    statusEl.hidden = false;
    setTextIfChanged(statusEl, "status", message);
}
    }

    function formatNumber(value) {
return String(Math.max(0, value)).padStart(2, "0");
    }

    function updateCountdown() {
const now = Date.now();
const difference = startTimeMs - now;

if (difference <= 0) {
    setTextIfChanged(daysEl, "days", "00");
    setTextIfChanged(hoursEl, "hours", "00");
    setTextIfChanged(minutesEl, "minutes", "00");
    setTextIfChanged(secondsEl, "seconds", "00");

    if (!Number.isNaN(lastEntryMs) && now < lastEntryMs) {
        setStatusMessage("Es geht los – der Einlass ist geöffnet!");
        return true;
    }

    setStatusMessage("Der Einlass für heute ist beendet.");
    return false;
}

// Vor Veranstaltungsbeginn keine weitere Datums-/Uhrzeitzeile anzeigen
setStatusMessage("");

const totalSeconds = Math.floor(difference / 1000);
const d = Math.floor(totalSeconds / 86400);
const h = Math.floor((totalSeconds % 86400) / 3600);
const m = Math.floor((totalSeconds % 3600) / 60);
const s = totalSeconds % 60;

setTextIfChanged(daysEl, "days", formatNumber(d));
setTextIfChanged(hoursEl, "hours", formatNumber(h));
setTextIfChanged(minutesEl, "minutes", formatNumber(m));
setTextIfChanged(secondsEl, "seconds", formatNumber(s));

return true;
    }

    const shouldKeepRunning = updateCountdown();
    let intervalId = null;

    if (shouldKeepRunning) {
intervalId = window.setInterval(() => {
    if (!updateCountdown() && intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
    }
}, 1000);

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        if (!updateCountdown() && intervalId) {
            window.clearInterval(intervalId);
            intervalId = null;
        }
    }
});
    }
}

/* =====================================================
   3b. NEWSLETTER-ANMELDUNG (BREVO DOUBLE-OPT-IN ÜBER /api/newsletter)
===================================================== */

function initNewsletter() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;

    const nameInput = document.getElementById("nlName");
    const emailInput = document.getElementById("nlEmail");
    const consentInput = document.getElementById("nlConsent");
    const honeypot = document.getElementById("nlWebsite");
    const nameErr = document.getElementById("nlNameErr");
    const emailErr = document.getElementById("nlEmailErr");
    const consentErr = document.getElementById("nlConsentErr");
    const formErr = document.getElementById("nlError");
    const submit = document.getElementById("nlSubmit");
    const submitText = submit.querySelector(".nl-submit-text");
    const success = document.getElementById("nlSuccess");
    const successEmail = document.getElementById("nlSuccessEmail");

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const SUBMIT_LABEL = submitText.textContent;
    let busy = false;

    // Link zur Datenschutzerklärung öffnet das Modal (ohne JS: normaler Anker)
    form.querySelectorAll("[data-datenschutz-open]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            openDatenschutzModal(link);
        });
    });

    function setFieldError(input, target, message) {
        target.textContent = message;
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
    }

    function setBusy(state) {
        busy = state;
        submit.disabled = state;
        submit.setAttribute("aria-busy", state ? "true" : "false");
        submit.classList.toggle("is-busy", state);
        submitText.textContent = state ? "Wird gesendet …" : SUBMIT_LABEL;
    }

    function validate() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        let firstInvalid = null;

        if (!name) {
            setFieldError(nameInput, nameErr, "Bitte gib deinen Vornamen ein.");
            firstInvalid = nameInput;
        } else if (name.length > 50) {
            setFieldError(nameInput, nameErr, "Der Vorname darf höchstens 50 Zeichen lang sein.");
            firstInvalid = nameInput;
        } else {
            setFieldError(nameInput, nameErr, "");
        }

        if (!email) {
            setFieldError(emailInput, emailErr, "Bitte gib deine E-Mail-Adresse ein.");
            firstInvalid = firstInvalid || emailInput;
        } else if (!EMAIL_RE.test(email)) {
            setFieldError(emailInput, emailErr, "Diese E-Mail-Adresse sieht unvollständig aus.");
            firstInvalid = firstInvalid || emailInput;
        } else {
            setFieldError(emailInput, emailErr, "");
        }

        if (!consentInput.checked) {
            setFieldError(consentInput, consentErr, "Bitte bestätige, dass du Infos per E-Mail erhalten möchtest.");
            firstInvalid = firstInvalid || consentInput;
        } else {
            setFieldError(consentInput, consentErr, "");
        }

        return firstInvalid;
    }

    // Fehler verschwinden, sobald das Feld korrigiert wird
    [[nameInput, nameErr], [emailInput, emailErr]].forEach(([input, target]) => {
        input.addEventListener("input", () => {
            if (input.hasAttribute("aria-invalid")) setFieldError(input, target, "");
            formErr.textContent = "";
        });
    });
    consentInput.addEventListener("change", () => {
        if (consentInput.checked) setFieldError(consentInput, consentErr, "");
        formErr.textContent = "";
    });

    const ERROR_TEXT = {
        invalid_email: "Diese E-Mail-Adresse wurde nicht akzeptiert. Bitte prüfe deine Eingabe.",
        invalid_name: "Bitte gib nur deinen Vornamen ein (ohne Links oder Sonderzeichen).",
        consent: "Bitte bestätige, dass du Infos per E-Mail erhalten möchtest."
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (busy) return;
        formErr.textContent = "";

        const invalid = validate();
        if (invalid) {
            invalid.focus();
            return;
        }

        setBusy(true);
        const email = emailInput.value.trim();

        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                    name: nameInput.value.trim(),
                    email: email,
                    consent: consentInput.checked,
                    website: honeypot ? honeypot.value : ""
                })
            });

            let data = null;
            try { data = await response.json(); } catch (e) { data = null; }

            if (response.ok && data && data.ok) {
                successEmail.textContent = email;
                form.hidden = true;
                success.hidden = false;
                success.focus();
                return;
            }

            const code = data && data.error;
            if (code === "invalid_email") {
                setFieldError(emailInput, emailErr, ERROR_TEXT.invalid_email);
                emailInput.focus();
            } else if (code === "invalid_name") {
                setFieldError(nameInput, nameErr, ERROR_TEXT.invalid_name);
                nameInput.focus();
            } else if (code === "consent") {
                setFieldError(consentInput, consentErr, ERROR_TEXT.consent);
                consentInput.focus();
            } else if (response.status === 403) {
                formErr.textContent = "Anmeldung blockiert. Lade die Seite neu und versuche es erneut.";
            } else {
                formErr.textContent = "Die Anmeldung hat gerade nicht geklappt. Versuche es in ein paar Minuten erneut oder schreib uns an gogosofficialgroup@gmail.com.";
            }
        } catch (err) {
            formErr.textContent = "Keine Verbindung zum Server. Prüfe deine Internetverbindung und versuche es erneut.";
        }

        setBusy(false);
    });
}

/* =====================================================
   4. FAQ ACCORDION (ZENTRAL KOORDINIERTE ANIMATIONEN)
===================================================== */

function initFaq() {
    const faqItems = Array.from(document.querySelectorAll(".faq-item"));
    if (faqItems.length === 0) return;

    const controllers = new Map();

    function cancelItemAnimation(details) {
const ctrl = controllers.get(details);
if (ctrl && ctrl.animation) {
    ctrl.animation.onfinish = null;
    ctrl.animation.oncancel = null;
    ctrl.animation.cancel();
    ctrl.animation = null;
}
if (ctrl && ctrl.answer) {
    ctrl.answer.style.height = "";
}
    }

    function closeDetailsItem(details, animate) {
const ctrl = controllers.get(details);
if (!ctrl || !details.open) return;

cancelItemAnimation(details);

if (!animate || reduceMotion || typeof ctrl.answer.animate !== "function") {
    details.open = false;
    return;
}

const startHeight = `${ctrl.answer.offsetHeight}px`;
const anim = ctrl.answer.animate(
    [{ height: startHeight }, { height: "0px" }],
    { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
);
ctrl.animation = anim;

anim.onfinish = () => {
    if (ctrl.animation !== anim) return;
    ctrl.animation = null;
    details.open = false;
    ctrl.answer.style.height = "";
};

anim.oncancel = () => {
    if (ctrl.animation === anim) {
        ctrl.animation = null;
    }
    ctrl.answer.style.height = "";
};
    }

    function openDetailsItem(details, animate) {
const ctrl = controllers.get(details);
if (!ctrl) return;

cancelItemAnimation(details);
details.open = true;

if (!animate || reduceMotion || typeof ctrl.answer.animate !== "function") {
    return;
}

const endHeight = `${ctrl.inner.offsetHeight}px`;
const anim = ctrl.answer.animate(
    [{ height: "0px" }, { height: endHeight }],
    { duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
);
ctrl.animation = anim;

anim.onfinish = () => {
    if (ctrl.animation !== anim) return;
    ctrl.animation = null;
    ctrl.answer.style.height = "";
};

anim.oncancel = () => {
    if (ctrl.animation === anim) {
        ctrl.animation = null;
    }
    ctrl.answer.style.height = "";
};
    }

    faqItems.forEach((details) => {
const summary = details.querySelector(".faq-question");
const answer = details.querySelector(".faq-answer");
const inner = details.querySelector(".faq-answer-inner");
if (!summary || !answer || !inner) return;

controllers.set(details, {
    summary,
    answer,
    inner,
    animation: null
});

summary.addEventListener("click", (event) => {
    event.preventDefault();

    const ctrl = controllers.get(details);
    const isCurrentlyClosing = Boolean(ctrl && ctrl.animation && details.open);

    if (details.open && !isCurrentlyClosing) {
        closeDetailsItem(details, true);
    } else {
        faqItems.forEach((other) => {
            if (other !== details && other.open) {
                closeDetailsItem(other, true);
            }
        });
        openDetailsItem(details, true);
    }
});
    });
}

/* =====================================================
   5. SCROLL-ZUSTÄNDE, SELEKTIVES REVEAL & BFCACHE-SCHUTZ
===================================================== */

function initScrollAndReveal() {
    let scrollTicking = false;

    function updateScrollState() {
const y = Math.max(0, window.scrollY || window.pageYOffset || 0);

if (header) {
    header.classList.toggle("scrolled", y > 20);
}

if (backTop) {
    backTop.classList.toggle("visible", y > 600);
}
    }

    // Initialen Zustand sofort ohne Transition setzen
    updateScrollState();

    window.requestAnimationFrame(() => {
if (header) header.classList.add("transitions-ready");
if (backTop) backTop.classList.add("transitions-ready");
    });

    window.addEventListener(
"scroll",
() => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
        updateScrollState();
        scrollTicking = false;
    });
},
{ passive: true }
    );

    if (backTop) {
backTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
    });
    if (mainElement) {
        mainElement.focus({ preventScroll: true });
    }
});
    }

    if ("IntersectionObserver" in window && heroSection) {
const heroObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            heroSection.classList.toggle("is-offscreen", !entry.isIntersecting);
        });
    },
    { threshold: 0 }
);
heroObserver.observe(heroSection);
    }

    // Selektives Reveal: Bereits sichtbare oder oberhalb liegende Elemente werden NIEMALS ausgeblendet
    const revealElements = Array.from(document.querySelectorAll(".reveal"));
    let revealObserver = null;

    function revealAllImmediately() {
if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
}
revealElements.forEach((el) => {
    el.classList.remove("reveal-pending", "reveal-animate");
});
    }

    function setupSelectiveReveals() {
if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAllImmediately();
    return;
}

const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
const belowFoldElements = [];

revealElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    // Nur Elemente vorbereiten, die noch deutlich unterhalb des aktuellen Sichtbereichs liegen
    if (rect.top > viewportHeight * 0.96) {
        el.classList.add("reveal-pending");
        belowFoldElements.push(el);
    } else {
        el.classList.remove("reveal-pending", "reveal-animate");
    }
});

if (belowFoldElements.length === 0) return;

window.requestAnimationFrame(() => {
    belowFoldElements.forEach((el) => {
        if (el.classList.contains("reveal-pending")) {
            el.classList.add("reveal-animate");
        }
    });
});

try {
    revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const revealedEl = entry.target;
                    revealedEl.classList.remove("reveal-pending");
                    revealObserver.unobserve(revealedEl);
                    // Nach der Einblend-Animation Klassen entfernen, damit Hover-Transitions wieder greifen
                    window.setTimeout(() => {
                        revealedEl.classList.remove("reveal-animate", "delay-1", "delay-2", "delay-3");
                    }, 900);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -20px 0px"
        }
    );

    belowFoldElements.forEach((el) => revealObserver.observe(el));
} catch (_) {
    revealAllImmediately();
}
    }

    setupSelectiveReveals();

    // Falls der Browser bei Reload/Zurücknavigation die Scrollposition erst bei pageshow anwendet:
    // Alle nun im Sichtfeld liegenden Elemente sofort ohne Animation sichtbar schalten.
    window.addEventListener("pageshow", (event) => {
updateScrollState();

const vh = window.innerHeight || document.documentElement.clientHeight || 800;
revealElements.forEach((el) => {
    if (el.classList.contains("reveal-pending")) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh * 0.98) {
            el.classList.remove("reveal-pending", "reveal-animate");
            if (revealObserver) {
                revealObserver.unobserve(el);
            }
        }
    }
});

if (event.persisted) {
    if (typeof abortIntroSafely === "function") {
        abortIntroSafely();
    }
    if (!isMenuOpen && !isModalOpen && !isGalleryOpen && !isDatenschutzOpen) {
        setElementInert(header, false);
        setElementInert(mainElement, false);
        setElementInert(footerElement, false);
        updateScrollbarCompensation(false);
    }
}
    });

    motionQuery.addEventListener("change", (event) => {
if (event.matches) {
    revealAllImmediately();
}
    });
}

/* =====================================================
   COOKIE-CONSENT & GOOGLE TAG MANAGER (ECHTES OPT-IN)
===================================================== */

const CONSENT_KEY = "schattenschreck_cookie_consent_v1";
const GTM_ID = "GTM-5DK82LGV";
let gtmLoaded = false;
let memoryConsent = null; // Fallback, falls localStorage blockiert ist
let cookieBannerTimer = null;
let lastCookieTrigger = null;

function readStoredConsent() {
    try {
const value = window.localStorage.getItem(CONSENT_KEY);
return (value === "granted" || value === "denied") ? value : null;
    } catch (_) {
return memoryConsent;
    }
}

function storeConsent(value) {
    memoryConsent = value;
    try {
window.localStorage.setItem(CONSENT_KEY, value);
    } catch (_) {
/* Speicher blockiert: Entscheidung gilt nur für diesen Seitenaufruf */
    }
}

// Lädt den Google Tag Manager – ausschließlich nach aktiver Einwilligung, max. einmal pro Seitenaufruf
function loadGoogleTagManager() {
    if (gtmLoaded) return;
    gtmLoaded = true;

    (function (w, d, s, l, i) {
w[l] = w[l] || [];
w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l !== "dataLayer" ? "&l=" + l : "";
j.async = true;
j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", GTM_ID);
}

function deleteAnalyticsCookies() {
    const host = window.location.hostname;
    const parts = host.split(".");
    const domains = [null, host, "." + host];
    for (let i = 1; i < parts.length - 1; i++) {
domains.push("." + parts.slice(i).join("."));
    }

    document.cookie.split(";").forEach((cookie) => {
const name = cookie.split("=")[0].trim();
if (!/^(_ga|_gid|_gat)/.test(name)) return;
domains.forEach((domain) => {
    document.cookie =
        name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/" +
        (domain ? "; domain=" + domain : "");
});
    });
}

function isIntroBlocking() {
    return docEl.classList.contains("intro-pending") ||
document.body.classList.contains("intro-active");
}

function showCookieBanner(moveFocus) {
    if (!cookieBanner) return;
    if (cookieBannerTimer) {
window.clearTimeout(cookieBannerTimer);
cookieBannerTimer = null;
    }

    // Läuft gerade ein Overlay, bleibt der Banner darunter inaktiv
    if (footerElement && footerElement.hasAttribute("inert")) {
cookieBanner.setAttribute("inert", "");
cookieBanner.setAttribute("aria-hidden", "true");
    }

    cookieBanner.hidden = false;
    void cookieBanner.offsetWidth; // Reflow, damit die Einblend-Transition greift
    cookieBanner.classList.add("is-visible");

    if (moveFocus) {
const firstButton = document.getElementById("cookieDeny");
if (firstButton) {
    firstButton.focus({ preventScroll: true });
}
    }
}

function hideCookieBanner() {
    if (!cookieBanner || cookieBanner.hidden) return;

    if (cookieBanner.contains(document.activeElement)) {
if (
    lastCookieTrigger &&
    document.contains(lastCookieTrigger) &&
    typeof lastCookieTrigger.focus === "function" &&
    lastCookieTrigger.offsetParent !== null
) {
    lastCookieTrigger.focus({ preventScroll: true });
} else if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
}
    }

    cookieBanner.classList.remove("is-visible");
    const instant = typeof reduceMotion !== "undefined" && reduceMotion;
    cookieBannerTimer = window.setTimeout(() => {
cookieBanner.hidden = true;
cookieBannerTimer = null;
    }, instant ? 0 : 320);
}

// Banner erst einblenden, wenn das Cinematic Intro beendet/übersprungen ist
function showCookieBannerAfterIntro() {
    if (!isIntroBlocking()) {
showCookieBanner(false);
return;
    }

    const observer = new MutationObserver(() => {
if (isIntroBlocking()) return;
observer.disconnect();
window.setTimeout(() => {
    if (readStoredConsent() === null) {
        showCookieBanner(false);
    }
}, 600);
    });
    observer.observe(docEl, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

function applyConsent(choice) {
    const previous = readStoredConsent();
    storeConsent(choice);

    if (choice === "granted") {
loadGoogleTagManager();
hideCookieBanner();
return;
    }

    // Widerruf einer früheren Zustimmung bzw. bereits geladener GTM: Cookies löschen, sauber neu laden
    if (previous === "granted" || gtmLoaded) {
deleteAnalyticsCookies();
try {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
} catch (_) {
    /* ignorieren */
}
window.location.reload();
return;
    }

    hideCookieBanner();
}

function openCookieSettings(triggerElement) {
    if (isDatenschutzOpen) {
closeDatenschutzModal(false);
    }
    lastCookieTrigger = triggerElement || null;
    showCookieBanner(true);
}

function initCookieConsent() {
    const stored = readStoredConsent();

    if (stored === "granted") {
loadGoogleTagManager();
    }

    if (!cookieBanner) return;

    const acceptButton = document.getElementById("cookieAccept");
    const denyButton = document.getElementById("cookieDeny");

    if (acceptButton) {
acceptButton.addEventListener("click", () => applyConsent("granted"));
    }
    if (denyButton) {
denyButton.addEventListener("click", () => applyConsent("denied"));
    }

    // Links im Banner öffnen die Modals über dem Banner, ohne eine Entscheidung auszulösen
    cookieBanner.querySelectorAll("[data-cookie-open]").forEach((link) => {
link.addEventListener("click", (event) => {
    event.preventDefault();
    if (link.dataset.cookieOpen === "datenschutz") {
        openDatenschutzModal(link);
    } else {
        openImpressumModal(link);
    }
});
    });

    const settingsButton = document.getElementById("cookieSettingsButton");
    if (settingsButton) {
settingsButton.setAttribute("aria-controls", "cookieBanner");
settingsButton.addEventListener("click", () => openCookieSettings(settingsButton));
    }
    document.querySelectorAll("[data-cookie-settings]").forEach((btn) => {
btn.addEventListener("click", () => openCookieSettings(settingsButton || btn));
    });

    if (stored === null) {
showCookieBannerAfterIntro();
    }
}

/* =====================================================
   INITIALISIERUNG MIT FEHLERISOLIERUNG & NOTFALL-FREIGABE
===================================================== */

try {
    initIntro();
} catch (err) {
    console.error("Intro-Initialisierungsfehler:", err);
    docEl.classList.remove("intro-pending");
    document.body.classList.remove("intro-active");
    const introEl = document.getElementById("introScreen");
    if (introEl) introEl.hidden = true;
    setElementInert(header, false);
    setElementInert(mainElement, false);
    setElementInert(footerElement, false);
}

const modules = [
    initCookieConsent,
    initNavigationAndOverlays,
    initGallery,
    initCountdown,
    initNewsletter,
    initFaq,
    initScrollAndReveal
];

modules.forEach((initFn) => {
    try {
initFn();
    } catch (err) {
console.error("Modul-Initialisierungsfehler:", err);
    }
});
})();
