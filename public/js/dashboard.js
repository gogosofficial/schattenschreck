(function () {
  "use strict";

  const user = document.body.dataset.user || "";
  const msg = document.getElementById("dashMsg");

  function showMessage(text) {
    if (!msg) return;
    msg.textContent = text;
    msg.hidden = !text;
  }

  /* ---------- Abmelden ---------- */
  const logout = document.getElementById("logout");
  logout.addEventListener("click", async () => {
    logout.disabled = true;
    logout.textContent = "Wird abgemeldet …";
    showMessage("");
    try {
      const r = await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
      if (!r.ok) throw new Error(String(r.status));
      location.replace("/login.html");
    } catch {
      logout.disabled = false;
      logout.textContent = "Abmelden";
      showMessage("Abmelden hat nicht geklappt. Prüfe deine Verbindung und versuche es erneut.");
    }
  });

  /* ---------- Aufgaben (Fortschritt lokal im Browser) ---------- */
  const boxes = Array.from(document.querySelectorAll(".tasks input"));
  const progress = document.getElementById("taskProgress");
  const count = document.getElementById("taskCount");
  const statusV = document.getElementById("taskStatusV");
  const statusItem = document.getElementById("taskStatus");
  const live = document.getElementById("taskLive");
  const reset = document.getElementById("taskReset");
  const key = (cb) => "ss_task_" + user + "_" + cb.dataset.id;

  function update(announce) {
    const done = boxes.filter((cb) => cb.checked).length;
    const total = boxes.length;
    if (progress) progress.value = done;
    if (count) count.textContent = done + " / " + total;
    if (statusV) statusV.textContent = done === total ? "Alle erledigt" : (total - done) + " offen";
    if (statusItem) statusItem.classList.toggle("is-ok", done === total && total > 0);
    if (reset) reset.hidden = done === 0;
    if (announce && live) live.textContent = done + " von " + total + " Aufgaben erledigt.";
  }

  boxes.forEach((cb) => {
    try { cb.checked = localStorage.getItem(key(cb)) === "1"; } catch {}
    cb.addEventListener("change", () => {
      try { localStorage.setItem(key(cb), cb.checked ? "1" : "0"); } catch {}
      update(true);
    });
  });

  if (reset) {
    reset.addEventListener("click", () => {
      boxes.forEach((cb) => {
        cb.checked = false;
        try { localStorage.removeItem(key(cb)); } catch {}
      });
      update(true);
      if (boxes[0]) boxes[0].focus();
    });
  }

  update(false);

  /* ---------- Bereichsnavigation: aktiven Abschnitt markieren ---------- */
  const links = Array.from(document.querySelectorAll(".dash-nav a"));
  if ("IntersectionObserver" in window && links.length) {
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const a = byId.get(e.target.id);
        if (a) a.setAttribute("aria-current", "location");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
