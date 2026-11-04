/* ============================================================================
  HelloKitty Baby Maxi 💔 — Schlaf-/Wartungs-Gate (läuft ALS ALLERERSTES im <head>, vor
   jedem anderen Skript/Stylesheet). Nutzt bewusst SYNCHRONE XHR-Aufrufe,
   damit der Browser das Parsen der restlichen Seite erst fortsetzt, NACHDEM
   feststeht, ob der Wartungsmodus aktiv ist — so kann keine andere Seite
   (App-Shell, Login-Formular, Landingpage …) auch nur kurz aufblitzen,
  bevor die Statusseite den kompletten Dokument-Inhalt
   ersetzt und window.stop() alle weiteren Ladevorgänge abbricht.
   Ausnahme: /login.html bleibt IMMER erreichbar, damit sich der Owner
   überhaupt einloggen kann, um den Wartungsmodus wieder zu beenden.
   ==========================================================================*/
(function () {
  'use strict';
  try {
    if (location.pathname === '/login.html') return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/maintenance', false);
    xhr.send(null);
    if (xhr.status !== 200) return;

    var info = null;
    try { info = JSON.parse(xhr.responseText || '{}'); } catch (e) { return; }
    var sleeping = !!info && info.mode === 'sleep';
    if (!info || (!info.on && !sleeping)) return;
    if (!sleeping && info.ownerAllowed === true) return;

    /* Owner-Ausnahme: wer bereits mit gültigem Owner-Token eingeloggt ist,
       darf die Website während der Wartung weiter benutzen. */
    var token = null;
    try { token = localStorage.getItem('love_token'); } catch (e) {}
    if (token) {
      try {
        var xhr2 = new XMLHttpRequest();
        xhr2.open('GET', '/api/me', false);
        xhr2.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr2.send(null);
        if (xhr2.status === 200) {
          var me = JSON.parse(xhr2.responseText || '{}');
          if (!sleeping && me && me.role === 'owner') return; /* Owner-Bypass nur bei Wartung */
        }
      } catch (e) {}
    }

    var esc = function (s) {
      return String(s || '').replace(/[<>&"]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
      });
    };
    var reason = esc(info.reason || 'Kein Grund angegeben');
    var since = info.since ? new Date(info.since).toLocaleString('de-DE') : '—';
    var by = esc(info.by || 'Owner');
    var pageTitle = sleeping ? '🌙 Schlafenszeit — HelloKitty Baby Maxi 💜' : '🛠️ Zugriff verweigert — Wartungsmodus | HelloKitty Baby Maxi 💔';
    var icon = sleeping ? '☾ 💤' : '🛠️🚫';
    var heading = sleeping ? 'Schlafenszeit' : 'ZUGRIFF VERWEIGERT';
    var sub = sleeping
      ? 'HelloKitty Baby Maxi macht ein kleines Nickerchen.'
      : 'HelloKitty Baby Maxi 💔 befindet sich gerade im Wartungsmodus';
    var foot = sleeping
      ? 'Mein Hauptowner kann mich mit $aufstehen wieder wecken. Bis dahin träume ich noch ein bisschen weiter. 💗'
      : '☾ Die Website ist während der Wartung für alle außer den Owner gesperrt.<br>Bitte versuche es gleich noch einmal — HelloKitty Baby Maxi 💔 by Maxichen 2026';
    var sleepContent = sleeping
      ? '<div class="sleep-art"><img src="/assets/img/sleeping-friends.png?v=neon-bedroom-20261012" alt="Zwei erwachsene Freundinnen kuscheln in rosa und schwarzen Schleifenkätzchen-Pyjamas in einem pinken Neon-Prinzessinnenzimmer." width="1200" height="700"></div>' +
        '<p class="sleep-note">Psst … hier wird gerade ganz leise geschlafen.<br><span>Warte einfach ein wenig — wenn ich aufstehe, läuft alles wieder wie gewohnt. 🥺</span></p>'
      : '<div class="reason"><span class="k">📄 Grund</span><span class="v">' + reason + '</span></div>' +
        '<div class="meta"><span class="chip">🕒 Seit <b>' + esc(since) + '</b></span><span class="chip">👑 Von <b>' + by + '</b></span></div>';

    var html = '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>' + pageTitle + '</title>' +
      '<style>' +
      '*{box-sizing:border-box}' +
      'html,body{height:100%;margin:0}' +
      'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;-webkit-font-smoothing:antialiased;' +
      'background:radial-gradient(1200px 700px at 82% -10%,rgba(167,139,250,.22),transparent 60%),radial-gradient(1000px 600px at -10% 30%,rgba(244,114,182,.15),transparent 60%),radial-gradient(900px 700px at 55% 115%,rgba(34,211,238,.10),transparent 60%),linear-gradient(180deg,#07050f,#0b0718 55%,#100a22)}' +
      /* 💎 Liquid-Glass-Referenz: mehrschichtige Karte mit Rim-Light */
      '.card{position:relative;max-width:640px;width:100%;padding:46px 38px;border-radius:26px;overflow:hidden;text-align:center;' +
      'background:radial-gradient(140% 130% at 50% -20%,rgba(255,255,255,.13),rgba(255,255,255,.04) 40%,transparent 74%),radial-gradient(60% 80% at 12% 0%,rgba(255,255,255,.13),transparent 58%),radial-gradient(46% 64% at 88% 100%,rgba(255,255,255,.07),transparent 66%),linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02) 48%,rgba(0,0,0,.07));' +
      'border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(20px) saturate(165%);-webkit-backdrop-filter:blur(20px) saturate(165%);' +
      'box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.34),inset 0 -1px 0 rgba(0,0,0,.23),0 24px 60px rgba(0,0,0,.40),0 4px 14px rgba(0,0,0,.22)}' +
      '.card::before{content:"";position:absolute;inset:1px 14% auto;height:1px;border-radius:50%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent);opacity:.72;pointer-events:none}' +
      '.brand{font-size:11px;font-weight:600;letter-spacing:5px;background:linear-gradient(90deg,#c4b5fd,#67e8f9);-webkit-background-clip:text;background-clip:text;color:transparent;text-transform:uppercase}' +
      '.ico{font-size:62px;line-height:1;margin:16px 0 6px;filter:drop-shadow(0 0 24px rgba(248,113,113,.55))}' +
      'h1{font-size:27px;margin:10px 0 6px;letter-spacing:-.02em;background:linear-gradient(120deg,#fff 20%,#b6c2ff 55%,#67e8f9 100%);-webkit-background-clip:text;background-clip:text;color:transparent}' +
      '.sub{color:rgba(255,255,255,.62);font-size:14.5px;margin-bottom:26px}' +
      '.reason{background:radial-gradient(140% 130% at 50% -20%,rgba(248,113,113,.12),rgba(248,113,113,.04) 40%,transparent 74%),rgba(0,0,0,.18);border:1px solid rgba(248,113,113,.35);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(0,0,0,.22),0 12px 30px rgba(0,0,0,.24);border-radius:16px;padding:18px 20px;margin:0 0 22px;text-align:left}' +
      '.reason .k{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:rgba(255,255,255,.5);margin-bottom:6px}' +
      '.reason .v{font-size:16.5px;font-weight:600;color:#fff;line-height:1.5}' +
      '.meta{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:26px}' +
      '.chip{background:radial-gradient(140% 130% at 50% -20%,rgba(255,255,255,.06),transparent 70%),linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008) 50%,rgba(0,0,0,.035));border:1px solid rgba(255,255,255,.11);box-shadow:inset 0 1px 0 rgba(255,255,255,.17),0 4px 12px rgba(0,0,0,.16);border-radius:999px;padding:7px 14px;font-size:12.5px;color:rgba(255,255,255,.75)}' +
      '.chip b{color:#fff}' +
      '.foot{font-size:12.5px;color:rgba(255,255,255,.4);font-style:italic;margin-top:6px}' +
      '.pulse{display:inline-block;width:9px;height:9px;border-radius:50%;background:#f87171;box-shadow:0 0 10px #f87171;margin-right:8px;animation:pulse 1.6s ease-in-out infinite}' +
      'body.sleeping{min-height:100%;height:auto;overflow-y:auto;padding:28px 18px;background:radial-gradient(900px 520px at 12% 0%,rgba(255,170,216,.2),transparent 65%),radial-gradient(800px 500px at 100% 85%,rgba(203,160,255,.2),transparent 65%),linear-gradient(155deg,#1b1230,#321d45 56%,#211631)}' +
      'body.sleeping .card{max-width:900px;padding:30px 34px 28px;border-radius:32px;border-color:rgba(255,196,226,.42);background:linear-gradient(150deg,rgba(255,240,249,.11),rgba(57,30,71,.76));box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 28px 80px rgba(8,3,18,.42)}' +
      'body.sleeping .brand{letter-spacing:2px;background:linear-gradient(90deg,#ffd0e9,#f7b6ff);-webkit-background-clip:text;background-clip:text}' +
      'body.sleeping .ico{font-size:30px;margin:22px 0 8px;filter:drop-shadow(0 0 18px rgba(255,183,222,.48))}' +
      'body.sleeping h1{margin:8px 0 7px;font-family:Georgia,"Times New Roman",serif;font-size:clamp(32px,6vw,48px);letter-spacing:0;background:linear-gradient(90deg,#fff3fa,#ffc8e4 55%,#e9ccff);-webkit-background-clip:text;background-clip:text}' +
      'body.sleeping .sub{margin:0 auto 18px;color:#f6ddec;font-size:15px}body.sleeping .pulse{background:#ffd0e9;box-shadow:0 0 12px rgba(255,180,219,.8);animation:none}' +
      '.sleep-art{width:100%;max-width:760px;margin:20px auto 18px}' +
      '.sleep-art img{display:block;width:100%;height:auto;border:1px solid rgba(255,211,236,.44);border-radius:24px;box-shadow:0 16px 44px rgba(12,5,24,.32)}' +
      '.sleep-note{margin:18px 0 12px;color:#fff4fb;font-family:Georgia,"Times New Roman",serif;font-size:20px;line-height:1.55}' +
      '.sleep-note span{color:#f1d9eb;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px}' +
      'body.sleeping .foot{max-width:620px;margin:12px auto 0;color:rgba(255,232,246,.65);font-size:13px;line-height:1.7}' +
      '@media(max-width:600px){body.sleeping{padding:16px 12px}body.sleeping .card{padding:24px 16px 22px;border-radius:25px}.sleep-art{margin:18px auto 14px}.sleep-art img{border-radius:18px}.sleep-note{font-size:18px}}' +
      '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}' +
      '</style></head><body' + (sleeping ? ' class="sleeping"' : '') + '>' +
      '<div class="card">' +
      '<div class="brand">HelloKitty Baby Maxi 💔 · Web</div>' +
      '<div class="ico">' + icon + '</div>' +
      '<h1>' + heading + '</h1>' +
      '<div class="sub"><span class="pulse"></span>' + sub + '</div>' +
      sleepContent +
      '<div class="foot">' + foot + '</div>' +
      '</div>' +
      '</body></html>';

    document.open();
    document.write(html);
    document.close();
    if (window.stop) window.stop();
  } catch (e) {
    /* Bei irgendeinem unerwarteten Fehler NIEMALS die Seite blockieren —
       lieber normal laden als versehentlich alle aussperren. */
  }
})();
