(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  var status = document.getElementById('contactStatus');
  if (!form || !status) return;

  var button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    status.textContent = 'Nachricht wird gesendet …';
    status.className = 'contact-status';
    if (button) button.disabled = true;

    try {
      var payload = Object.fromEntries(new FormData(form).entries());
      var response = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Senden fehlgeschlagen.');
      form.reset();
      status.textContent = 'Danke, deine Nachricht wurde an den Owner gesendet.';
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = error.message || 'Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.';
      status.classList.add('is-error');
    } finally {
      if (button) button.disabled = false;
    }
  });
}());