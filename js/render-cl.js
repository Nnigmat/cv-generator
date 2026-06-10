var RenderCL = (function () {
  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function md(text) {
    return esc(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  function render(profile, lang) {
    var p = profile.personal || {};
    var meta = profile.meta || {};
    var cl = profile.coverLetter || {};

    var greeting = lang === 'de'
      ? 'Sehr geehrtes ' + esc(meta.company || '') + '-Team,'
      : 'Dear ' + esc(meta.company || '') + ' Hiring Team,';

    var closing = lang === 'de' ? 'Mit freundlichen Grüßen,' : 'Warm regards,';

    var contact = [p.address, [p.phone, p.email].filter(Boolean).join(' | '), [p.linkedin, p.github].filter(Boolean).join(' | ')]
      .filter(Boolean).map(esc).join('<br>');

    var body = (cl.body ? (cl.body[lang] || '') : '').split('\n\n')
      .filter(function (t) { return t.trim(); })
      .map(function (para) { return '<p class="cl-para">' + md(para) + '</p>'; }).join('');

    var date = cl.date ? (cl.date[lang] || '') : '';

    var html = '<div class="cl-wrap">'
      + '<div style="margin-bottom:24px"><div class="cl-sender-name">' + esc(p.name || '') + '</div>'
      + '<div class="cl-sender-contact">' + contact + '</div></div>'
      + '<div class="cl-addressee"><strong>' + esc(meta.company || '') + '</strong><br>'
      + '<em style="font-size:9.5pt">' + esc(meta.position || '') + '</em></div>'
      + (date ? '<div style="margin-bottom:16px;font-size:9.5pt">' + esc(date) + '</div>' : '')
      + '<div style="margin-bottom:14px">' + greeting + '</div>'
      + body
      + '<div style="margin-top:24px;font-size:9.5pt"><div>' + closing + '</div>'
      + '<div style="margin-top:28px;font-weight:600">' + esc(p.name || '') + '</div></div>'
      + '</div>';

    document.getElementById('cl-preview').innerHTML = html;
  }

  return { render: render };
})();
