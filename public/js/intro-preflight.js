(function () {
    try {
        var docEl = document.documentElement;
        docEl.classList.add("js-enabled");

        var SESSION_KEY = "schattenschreck_intro_seen_2027";
        var FORCE_DEV_INTRO = false;

        var reduceMotion = false;
        if (window.matchMedia) {
            reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }

        var hasHash = Boolean(window.location.hash && window.location.hash !== "#");
        var navEntries = (window.performance && window.performance.getEntriesByType)
            ? window.performance.getEntriesByType("navigation")
            : [];
        var navType = (navEntries && navEntries[0]) ? navEntries[0].type : "";
        var isReloadOrBackForward = (navType === "reload" || navType === "back_forward");

        var hasSeenIntro = false;
        if (!FORCE_DEV_INTRO) {
            try {
                hasSeenIntro = window.sessionStorage.getItem(SESSION_KEY) === "1";
            } catch (_) {
                hasSeenIntro = false;
            }
        }

        if (!reduceMotion && !hasHash && !hasSeenIntro && !isReloadOrBackForward) {
            docEl.classList.add("intro-pending");
        }
    } catch (_) {
        document.documentElement.classList.remove("intro-pending");
    }
})();
