document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('statusMessage');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get('from_name') || '').trim();
    const email = String(data.get('reply_to') || '').trim();
    const subjectChoice = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = subjectChoice
      ? `Portfolio enquiry: ${subjectChoice}`
      : `Portfolio enquiry from ${name}`;
    const body = [
      `Name: ${name}`,
      `Reply email: ${email}`,
      '',
      message
    ].join('\n');
    const mailto = `mailto:unathibasholo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent = 'Your email application should open with the message prepared. Review it and press Send to deliver it.';
    status.classList.remove('hidden');
    status.classList.remove('text-red-600');
    status.classList.add('text-emerald-600');
    window.location.href = mailto;
  });
});
