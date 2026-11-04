/* ============================================================================
   LoveBot — LOGIN mit 2FA
   🔐 Ablauf für alle NICHT-Owner-Konten: 1) Nummer prüfen → 2) WhatsApp-Code
   (2FA) → 3) Passwort. Ohne gültigen Code gibt es kein Login, auch mit
   richtigem Passwort nicht.
   👑 AUSNAHME Owner: Schritt 2 (2FA) entfällt komplett — die Owner-Nummer
   springt direkt von Schritt 1 zu Schritt 3 (Passwort). Serverseitig
   ebenso durchgesetzt (server.js /api/login), das Frontend hier bildet das
   nur visuell ab.
   ==========================================================================*/
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let number = '';
  let role = '';
  let mailboxId = '';
  let loginToken = '';
  let pollTimer = null;
  let emailLinkToken = '';
  let loginEmailChallengeId = '';
  let registrationToken = '';
  let registrationEmailChallengeId = '';
  let registrationEmail = '';
  let resetRequestId = '';

  function msg(id, text, type) {
    const el = $(id);
    el.textContent = text;
    el.className = 'msg ' + (type || '') + (text ? ' boxed' : '');
  }

  function setStep(n) {
    [1, 2, 3].forEach((i) => {
      $('step' + i).style.display = i === n ? '' : 'none';
      const s = $('s' + i);
      s.className = 's' + (i < n ? ' done' : i === n ? ' act' : '');
      if (i < 3) $('b' + i).className = 'bar' + (i < n ? ' done' : '');
    });
    const focusId = { 1: 'loginNumber', 2: 'loginCode', 3: 'loginPassword' }[n];
    setTimeout(() => $(focusId).focus(), 60);
  }

  function showBan(ban) {
    const box = $('banBox');
    box.style.display = '';
    box.innerHTML = '⛔ <b>Dieses Konto ist gebannt.</b><br>' +
      'Grund: ' + (ban.reason || '—') + '<br>' +
      'Von: ' + (ban.by || 'LoveBot Automod') + '<br>' +
      'Kontakt: ' + (ban.owners || []).map((o) => o.name || o).join(', ');
  }

  /* ---------- SCHRITT 1: Nummer prüfen + Code anfordern ---------------------- */
  window.step1Go = async () => {
    const raw = $('loginNumber').value.trim();
    if (!raw) return msg('msg1', '☾ Bitte Nummer eingeben.', 'warn');
    $('btn1').disabled = true;
    msg('msg1', '🔎 Nummer wird geprüft …', 'info');
    $('banBox').style.display = 'none';
    try {
      const { data } = await API.post('/api/check-number', { number: raw });
      if (data.status === 'banned' && data.banned) { showBan(data.banned); msg('msg1', '', ''); $('btn1').disabled = false; return; }
      if (data.status === 'unknown') { msg('msg1', '❌ Kein Konto für diese Nummer. Registrierte Konten können sich einloggen — der Owner nutzt seine Owner-Nummer.', 'error'); $('btn1').disabled = false; return; }
      number = raw.replace(/@.*$/, '').replace(/\D/g, '');
      role = data.status;
      /* 👑 Owner-Ausnahme: KEIN WhatsApp-2FA-Code — direkt zum Passwort.
         Alle anderen Rollen (user/admin/…) durchlaufen weiterhin
         zwingend den 2FA-Schritt. */
      if (role === 'owner') {
        msg('msg1', '👑 Owner erkannt — kein 2FA-Code nötig. Passwort · Benutzername · Geburtsdatum eingeben.', 'ok');
        $('pwLabel').textContent = '👑 Owner-Passwort';
        if ($('ownerExtra')) $('ownerExtra').style.display = '';
        setStep(3);
        $('btn1').disabled = false;
        return;
      }
      msg('msg1', '✅ Konto gefunden: ' + (data.name || '') + '. Sende WhatsApp-Code …', 'ok');
      await requestCode();
    } catch (e) {
      msg('msg1', 'Server nicht erreichbar.', 'error');
      $('btn1').disabled = false;
    }
  };

  /* ---------- Code anfordern (Mailbox-Polling) -------------------------------- */
  window.requestCode = async () => {
    $('resendBtn').disabled = true;
    msg('msg2', '📤 Code wird per WhatsApp gesendet …', 'info');
    const { data } = await API.post('/api/request-code', { number, purpose: 'login' });
    if (!data.ok) {
      msg('msg2', data.error || 'Versand fehlgeschlagen.', 'error');
      $('resendBtn').disabled = false;
      return;
    }
    mailboxId = data.mailboxId;
    setStep(2);
    msg('msg2', '☾ Schau in WhatsApp — der Code ist unterwegs.', 'info');

    /* Mailbox pollen, bis der Bot den Code rausgeschickt hat */
    if (pollTimer) clearInterval(pollTimer);
    let tries = 0;
    pollTimer = setInterval(async () => {
      tries++;
      try {
        const r = await API.get('/api/mailbox/' + mailboxId);
        if (r.data.status === 'sent') {
          clearInterval(pollTimer); pollTimer = null;
          msg('msg2', '✅ Code gesendet. Gültig für 5 Minuten.', 'ok');
        } else if (r.data.status === 'error') {
          clearInterval(pollTimer); pollTimer = null;
          msg('msg2', '💔 Versand fehlgeschlagen: ' + (r.data.error || '') + ' — läuft Love.js?', 'error');
        } else if (tries > 24) { /* ~60 s */
          clearInterval(pollTimer); pollTimer = null;
          msg('msg2', '🌧️ Der Bot hat noch nicht gesendet. Läuft Love.js? ↻ versuchen es erneut.', 'warn');
        }
      } catch (e) {}
    }, 2500);
    $('resendBtn').disabled = false;
  };

  /* ---------- SCHRITT 2: Code bestätigen -------------------------------------- */
  window.step2Go = async () => {
    const code = $('loginCode').value.trim();
    if (code.length !== 6) return msg('msg2', '☾ Der Code hat 6 Stellen.', 'warn');
    $('btn2').disabled = true;
    msg('msg2', '🔐 Code wird geprüft …', 'info');
    const { data } = await API.post('/api/verify-code', { number, code, purpose: 'login' });
    $('btn2').disabled = false;
    if (data.ok) {
      if (data.emailRequired) {
        emailLinkToken = data.emailLinkToken;
        $('waLoginVerifyWrap').style.display = 'none';
        $('loginEmailVerifyWrap').style.display = '';
        msg('loginEmailMsg', 'WhatsApp bestätigt. Bitte hinterlege und bestätige jetzt deine E-Mail-Adresse.', 'info');
        return;
      }
      loginToken = data.loginToken;
      msg('msg2', '✅ Code richtig.', 'ok');
      $('pwLabel').textContent = role === 'owner' ? '👑 Owner-Passwort' : '🔐 Dein Passwort';
      setStep(3);
    } else {
      msg('msg2', data.error || '💔 Code falsch oder abgelaufen.', 'error');
    }
  };

  window.sendLoginEmailCode = async () => {
    const input = $('loginVerifyEmail');
    if (!input.checkValidity() || !input.value.trim()) return msg('loginEmailMsg', 'Bitte eine gültige E-Mail-Adresse eingeben.', 'warn');
    $('loginEmailSendBtn').disabled = true;
    try {
      const { data } = await API.post('/api/account-email/request', {
        emailLinkToken, email: input.value.trim()
      });
      if (!data.ok) return msg('loginEmailMsg', data.error || 'Code konnte nicht gesendet werden.', 'error');
      loginEmailChallengeId = data.emailChallengeId;
      msg('loginEmailMsg', 'Code gesendet. Er ist 10 Minuten gültig und nur einmal verwendbar.', 'ok');
    } catch (e) {
      msg('loginEmailMsg', 'E-Mail-Code konnte nicht angefordert werden.', 'error');
    } finally {
      $('loginEmailSendBtn').disabled = false;
    }
  };

  window.verifyLoginEmailCode = async () => {
    const code = $('loginEmailCode').value.trim();
    if (!loginEmailChallengeId) return msg('loginEmailMsg', 'Fordere zuerst einen E-Mail-Code an.', 'warn');
    if (!/^\d{6}$/.test(code)) return msg('loginEmailMsg', 'Der Code muss aus 6 Ziffern bestehen.', 'warn');
    $('loginEmailVerifyBtn').disabled = true;
    try {
      const { data } = await API.post('/api/account-email/verify', {
        emailLinkToken, emailChallengeId: loginEmailChallengeId, code
      });
      if (!data.ok) return msg('loginEmailMsg', data.error || 'Code ungültig.', 'error');
      loginToken = data.loginToken;
      msg('loginEmailMsg', 'E-Mail bestätigt.', 'ok');
      setStep(3);
      $('pwLabel').textContent = role === 'owner' ? '👑 Owner-Passwort' : '🔐 Dein Passwort';
    } catch (e) {
      msg('loginEmailMsg', 'E-Mail-Code konnte nicht bestätigt werden.', 'error');
    } finally {
      $('loginEmailVerifyBtn').disabled = false;
    }
  };

  /* ---------- SCHRITT 3: Passwort ---------------------------------------------- */
  window.step3Go = async () => {
    const password = $('loginPassword').value;
    if (!password) return msg('msg3', '☾ Passwort fehlt.', 'warn');
    const username = $('loginUser') ? $('loginUser').value.trim() : '';
    const birthday = $('loginBirthday') ? $('loginBirthday').value.trim() : '';
    if (role === 'owner' && !username) return msg('msg3', '☾ Benutzername fehlt (Maxichen).', 'warn');
    if (role === 'owner' && !birthday) return msg('msg3', '☾ Geburtsdatum fehlt (03.10.2009).', 'warn');
    $('btn3').disabled = true;
    msg('msg3', '💜 einen Moment …', 'info');
    const { data } = await API.post('/api/login', { number, password, loginToken, username, birthday });
    $('btn3').disabled = false;
    if (data.ok) {
      API.setToken(data.token);
      localStorage.setItem('love_name', data.name || '');
      localStorage.setItem('love_role', data.role || 'user');
      msg('msg3', '♡ welcome back, ' + (data.name || '') + '.', 'ok');
      setTimeout(() => (location.href = '/app.html'), 700);
      return;
    }
    if (data.error === 'banned' && data.banned) { showBan(data.banned); msg('msg3', '', ''); return; }
    msg('msg3', data.error || '💔 Passwort falsch.', 'error');
  };

  /* ---------- Registrierung: Username + Nummer + Code → USER ---------- */
  window.toggleReg = () => {
    const w = $('regWrap');
    w.style.display = w.style.display === 'none' ? '' : 'none';
  };
  window.regStart = async () => {
    const username = $('regUsername').value.trim();
    const number = $('regNumber').value.trim();
    const emailInput = $('regEmail');
    registrationEmail = emailInput.value.trim().toLowerCase();
    if (username.length < 3) return msg('regMsg', '☾ Username: mind. 3 Zeichen.', 'warn');
    if (!emailInput.checkValidity() || !registrationEmail) return msg('regMsg', '☾ Bitte eine gültige E-Mail-Adresse eingeben.', 'warn');
    $('regBtn1').disabled = true;
    msg('regMsg', ' Code wird gesendet …', 'info');
    const { data } = await API.post('/api/request-code', { number, email: registrationEmail, purpose: 'register' });
    if (!data.ok) { msg('regMsg', data.error || 'Fehler.', 'error'); $('regBtn1').disabled = false; return; }
    regNumberForReg = number.replace(/\D/g, '');
    regMailbox = data.mailboxId;
    $('regWhatsappWrap').style.display = '';
    msg('regMsg', '☾ Code ist unterwegs …', 'info');
    let tries = 0;
    const poll = setInterval(async () => {
      tries++;
      const r = await API.get('/api/mailbox/' + regMailbox);
      if (r.data.status === 'sent') { clearInterval(poll); msg('regMsg', '✅ Code gesendet.', 'ok'); }
      else if (r.data.status === 'error') { clearInterval(poll); msg('regMsg', '💔 Versandfehler: ' + (r.data.error || ''), 'error'); }
      else if (tries > 24) { clearInterval(poll); msg('regMsg', '🌧️ Bot sendet nicht — läuft Love.js?', 'warn'); }
    }, 2500);
    $('regBtn1').disabled = false;
  };
  let regNumberForReg = '';
  let regMailbox = '';
  window.regVerifyWhatsapp = async () => {
    const code = $('regCode').value.trim();
    if (!/^\d{6}$/.test(code)) return msg('regMsg', 'Bitte den 6-stelligen WhatsApp-Code eingeben.', 'warn');
    $('regWhatsappBtn').disabled = true;
    try {
      const verified = await API.post('/api/verify-code', { number: regNumberForReg, code, purpose: 'register' });
      if (!verified.data.ok) return msg('regMsg', verified.data.error || 'WhatsApp-Code ungültig.', 'error');
      registrationToken = verified.data.registrationToken;
      const sent = await API.post('/api/request-email-code', { registrationToken, email: registrationEmail });
      if (!sent.data.ok) return msg('regMsg', sent.data.error || 'E-Mail-Code konnte nicht gesendet werden.', 'error');
      registrationEmailChallengeId = sent.data.emailChallengeId;
      $('regWhatsappWrap').style.display = 'none';
      $('regEmailCodeWrap').style.display = '';
      $('regEmailTarget').textContent = registrationEmail;
      msg('regMsg', 'WhatsApp bestätigt. E-Mail-Code ist unterwegs.', 'ok');
      $('regEmailCode').focus();
    } catch (e) {
      msg('regMsg', 'Bestätigung konnte nicht abgeschlossen werden.', 'error');
    } finally {
      $('regWhatsappBtn').disabled = false;
    }
  };
  window.regFinish = async () => {
    const code = $('regEmailCode').value.trim();
    const password = $('regPassword').value;
    const username = $('regUsername').value.trim();
    /* 🔐 Ohne Zustimmung zur Datenschutzerklärung keine Kontoerstellung —
       serverseitig wird das in /api/register nochmal geprüft. */
    const privacyOk = $('regPrivacyOk') && $('regPrivacyOk').checked;
    if (!privacyOk) return msg('regMsg', '☾ Bitte zuerst der Datenschutzerklärung zustimmen (Häkchen setzen).', 'warn');
    if (password.length < 12 || password.length > 128) return msg('regMsg', 'Passwort muss 12 bis 128 Zeichen haben.', 'warn');
    const v = await API.post('/api/verify-email-code', {
      registrationToken, emailChallengeId: registrationEmailChallengeId, code
    });
    if (!v.data.ok) return msg('regMsg', v.data.error || 'E-Mail-Code falsch.', 'error');
    const r = await API.post('/api/register', { setupToken: v.data.setupToken, username, password, privacyAccepted: true });
    if (r.data.ok) {
      API.setToken(r.data.token);
      localStorage.setItem('love_name', r.data.name || '');
      localStorage.setItem('love_role', r.data.role || 'user');
      msg('regMsg', '♡ welcome to the night, ' + r.data.name + '.', 'ok');
      setTimeout(() => (location.href = '/app.html'), 800);
    } else {
      msg('regMsg', r.data.error || 'Fehler.', 'error');
    }
  };

  window.toggleForgot = () => {
    const panel = $('forgotWrap');
    panel.style.display = panel.style.display === 'none' ? '' : 'none';
  };

  window.requestPasswordReset = async () => {
    const number = $('resetNumber').value.trim().replace(/\D/g, '');
    if (number.length < 8 || number.length > 15) return msg('resetMsg', 'Bitte eine gültige Nummer mit Ländervorwahl eingeben.', 'warn');
    $('resetRequestBtn').disabled = true;
    try {
      const { data } = await API.post('/api/password-reset/request', { number });
      resetRequestId = data.requestId || '';
      $('resetCodeWrap').style.display = '';
      msg('resetMsg', data.message || 'Falls ein Konto existiert, wurde ein Code an E-Mail oder WhatsApp gesendet.', 'info');
    } catch (e) {
      msg('resetMsg', 'Anfrage konnte nicht verarbeitet werden.', 'error');
    } finally {
      $('resetRequestBtn').disabled = false;
    }
  };

  window.finishPasswordReset = async () => {
    const password = $('resetPassword').value;
    const code = $('resetCode').value.trim();
    if (!resetRequestId) return msg('resetMsg', 'Fordere zuerst einen Reset-Code an.', 'warn');
    if (!/^\d{6}$/.test(code)) return msg('resetMsg', 'Der Code muss aus 6 Ziffern bestehen.', 'warn');
    if (password.length < 12 || password.length > 128) return msg('resetMsg', 'Passwort muss 12 bis 128 Zeichen haben.', 'warn');
    $('resetFinishBtn').disabled = true;
    try {
      const { data } = await API.post('/api/password-reset/confirm', {
        requestId: resetRequestId, code, password
      });
      if (!data.ok) return msg('resetMsg', data.error || 'Reset fehlgeschlagen.', 'error');
      resetRequestId = '';
      $('resetCodeWrap').style.display = 'none';
      $('resetPassword').value = '';
      msg('resetMsg', data.message || 'Passwort geändert. Bitte anmelden.', 'ok');
    } catch (e) {
      msg('resetMsg', 'Passwort konnte nicht geändert werden.', 'error');
    } finally {
      $('resetFinishBtn').disabled = false;
    }
  };

  async function completeOAuthReturn() {
    const params = new URLSearchParams(location.hash.slice(1));
    const code = params.get('oauth_code');
    const linkCode = params.get('oauth_link_code');
    const linkError = params.get('oauth_link_error');
    const error = params.get('oauth_error');
    if (!code && !linkCode && !linkError && !error) return false;
    history.replaceState(null, '', location.pathname + location.search);
    setStep(1);
    if (linkError) {
      sessionStorage.setItem('love_oauth_link_error', linkError);
      location.replace('/app.html#/account');
      return true;
    }
    if (error) {
      msg('msg1', error, 'error');
      return false;
    }
    try {
      const { data } = await API.post(linkCode ? '/api/oauth/link/exchange' : '/api/oauth/exchange', { code: linkCode || code });
      if (!data.ok) {
        msg('msg1', data.error || 'OAuth-Anmeldung fehlgeschlagen.', 'error');
        return false;
      }
      if (data.linked) {
        sessionStorage.setItem('love_oauth_linked_provider', data.providerId || 'Anbieter');
        location.replace('/app.html#/account');
        return true;
      }
      API.setToken(data.token);
      localStorage.setItem('love_name', data.name || '');
      localStorage.setItem('love_role', data.role || 'user');
      location.replace('/app.html');
      return true;
    } catch (e) {
      msg('msg1', 'OAuth-Anmeldung konnte nicht abgeschlossen werden.', 'error');
      return false;
    }
  }

  async function loadOAuthProviders() {
    const defaults = [
      { id: 'google', label: 'Google', enabled: false },
      { id: 'discord', label: 'Discord', enabled: false },
      { id: 'github', label: 'GitHub', enabled: false }
    ];
    let providers = defaults;
    if (!API.isDemo()) {
      try {
        const { data } = await API.get('/api/oauth/providers');
        if (Array.isArray(data.providers)) providers = data.providers;
      } catch (e) {}
    }
    const section = $('oauthSection');
    const list = $('oauthProviders');
    for (const provider of providers) {
      if (!['google', 'discord', 'github'].includes(provider.id)) continue;
      const control = document.createElement(provider.enabled ? 'a' : 'button');
      control.className = 'oauth-button';
      control.dataset.provider = provider.id;
      if (provider.enabled) {
        control.href = '/api/oauth/start/' + provider.id;
        control.addEventListener('click', async (event) => {
          event.preventDefault();
          control.setAttribute('aria-busy', 'true');
          try {
            const { data } = await API.post('/api/oauth/start/' + provider.id, {
              allowSignup: $('oauthSignupConsent').checked
            });
            if (!data.ok || !data.url) {
              msg('oauthMsg', data.error || 'Anmeldung konnte nicht gestartet werden.', 'error');
              control.removeAttribute('aria-busy');
              return;
            }
            location.assign(data.url);
          } catch (e) {
            msg('oauthMsg', 'Anmeldung konnte nicht gestartet werden.', 'error');
            control.removeAttribute('aria-busy');
          }
        });
      } else {
        control.type = 'button';
        control.disabled = true;
        control.title = provider.label + '-Anmeldung ist noch nicht eingerichtet.';
      }
      const mark = document.createElement('span');
      mark.className = 'oauth-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = provider.id === 'google' ? 'G' : provider.id === 'discord' ? 'D' : 'GH';
      const copy = document.createElement('span');
      copy.className = 'oauth-copy';
      const label = document.createElement('span');
      label.textContent = provider.label;
      copy.appendChild(label);
      if (!provider.enabled) {
        const status = document.createElement('span');
        status.className = 'oauth-status';
        status.textContent = 'Noch nicht eingerichtet';
        copy.appendChild(status);
      }
      control.append(mark, copy);
      list.appendChild(control);
    }
    section.hidden = false;
    $('oauthAfterSep').hidden = false;
  }

  window.backTo = (n) => {
    setStep(n);
    ['msg1', 'msg2', 'msg3'].forEach((m) => msg(m, '', ''));
  };

  /* ---------- Boot -------------------------------------------------------------- */
  (async function () {
    await API.probe();
    if (await completeOAuthReturn()) return;
    await loadOAuthProviders();
    if (API.isDemo()) {
      const p = document.createElement('div');
      p.className = 'demo-pill';
      p.innerHTML = 'demo-modus · Nummer: <b>4915155894714</b> · Code: kommt als Toast · Passwort: <b>lovebot</b>';
      document.body.appendChild(p);
    }
    if (API.getToken()) {
      const me = await API.get('/api/me');
      if (me.data && me.data.ok !== false && me.data.name) location.href = '/app.html';
    }
    setStep(1);
  })();
})();
