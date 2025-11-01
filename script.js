// Basic interactivity: mobile nav, smooth scroll, set year, form validation, submit helper, print
document.addEventListener('DOMContentLoaded', () => {
  // year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // mobile nav
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  if (navToggle) navToggle.addEventListener('click', () => nav.classList.toggle('open'));
  if (navClose) navClose.addEventListener('click', () => nav.classList.remove('open'));

  // smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nav.classList.remove('open');
      }
    });
  });

  // Application form handling
  const form = document.getElementById('appForm');
  const printBtn = document.getElementById('printBtn');
  const msg = document.getElementById('formMsg');

  // Print to PDF
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // hide other UI that shouldn't print (if needed) - keep presentation minimal
      window.print();
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    // simple client validation
    const required = ['fullName','dob','phone','livingSituation','emergency','story'];
    for (const id of required) {
      const el = form.querySelector(`#${id}`);
      if (!el) continue;
      if (!el.value || (el.value.trim && el.value.trim() === '')) {
        el.focus();
        msg.textContent = 'Please complete all required fields marked with *. ';
        return;
      }
    }

    // If site owner configured a submission endpoint, use it.
    const endpoint = form.dataset.endpoint && form.dataset.endpoint.trim();
    if (!endpoint) {
      // No endpoint configured: show instructions and offer to print/save as PDF
      msg.innerHTML = 'This site is not yet configured to send applications by email. <strong>To enable online submission:</strong> sign up for Formspree or Netlify Forms (free) and set the form endpoint URL into the form\'s <code>data-endpoint</code> attribute. Meanwhile, click <em>Print / Save as PDF</em> to save and email the file.';
      return;
    }

    // try to POST form as form-encoded JSON to the endpoint
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((v,k) => payload[k] = v);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        msg.textContent = 'Application submitted — thank you. We will review and follow up.';
        form.reset();
      } else {
        msg.textContent = 'Submission failed. Please print the form and email it to us, or contact hello@beautyfromashes.org';
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'There was an error sending your application. Please print/save as PDF and email it to hello@beautyfromashes.org';
    }
  });
});
