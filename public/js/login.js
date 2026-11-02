(function () {
  "use strict";

  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const err = document.getElementById("err");
  const btn = document.getElementById("btn");
  const btnText = btn.querySelector(".btn-text");
  const emailErr = document.getElementById("emailErr");
  const pwErr = document.getElementById("pwErr");
  const capsHint = document.getElementById("capsHint");
  const pwToggle = document.getElementById("pwToggle");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(input, target, message) {
    target.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function setBusy(busy) {
    btn.disabled = busy;
    btn.setAttribute("aria-busy", busy ? "true" : "false");
    btn.classList.toggle("is-busy", busy);
    btnText.textContent = busy ? "Wird geprüft …" : "Einloggen";
  }

  function validate() {
    const e = email.value.trim();
    const p = password.value;
    let firstInvalid = null;

    if (!e) { setFieldError(email, emailErr, "Bitte gib deine E-Mail-Adresse ein."); firstInvalid = email; }
    else if (!EMAIL_RE.test(e)) { setFieldError(email, emailErr, "Diese E-Mail-Adresse sieht unvollständig aus."); firstInvalid = email; }
    else setFieldError(email, emailErr, "");

    if (!p) { setFieldError(password, pwErr, "Bitte gib dein Passwort ein."); firstInvalid = firstInvalid || password; }
    else setFieldError(password, pwErr, "");

    return firstInvalid;
  }

  // Fehler verschwinden, sobald das Feld korrigiert wird
  email.addEventListener("input", () => { if (email.hasAttribute("aria-invalid")) setFieldError(email, emailErr, ""); err.textContent = ""; });
  password.addEventListener("input", () => { if (password.hasAttribute("aria-invalid")) setFieldError(password, pwErr, ""); err.textContent = ""; });

  // Hinweis bei aktiver Feststelltaste
  function checkCaps(ev) {
    if (typeof ev.getModifierState === "function") capsHint.hidden = !ev.getModifierState("CapsLock");
  }
  password.addEventListener("keydown", checkCaps);
  password.addEventListener("keyup", checkCaps);
  password.addEventListener("blur", () => { capsHint.hidden = true; });

  // Passwort anzeigen/verbergen
  pwToggle.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    pwToggle.textContent = show ? "Verbergen" : "Anzeigen";
    pwToggle.setAttribute("aria-pressed", show ? "true" : "false");
    password.focus();
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    err.textContent = "";

    const invalid = validate();
    if (invalid) { invalid.focus(); return; }

    setBusy(true);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.value.trim(), password: password.value }),
      });
      if (r.ok) {
        btnText.textContent = "Angemeldet – Dashboard wird geladen …";
        location.replace("/dashboard");
        return;
      }
      if (r.status === 401) {
        err.textContent = "E-Mail oder Passwort ist falsch. Prüfe deine Eingabe und versuche es erneut.";
        password.select();
        password.focus();
      } else if (r.status === 403) {
        err.textContent = "Anmeldung blockiert. Öffne den Login direkt über diese Webseite und versuche es erneut.";
      } else {
        err.textContent = "Der Login ist gerade nicht erreichbar (Fehler " + r.status + "). Versuche es in ein paar Minuten erneut.";
      }
    } catch {
      err.textContent = "Keine Verbindung zum Server. Prüfe deine Internetverbindung und versuche es erneut.";
    }
    setBusy(false);
  });
})();
