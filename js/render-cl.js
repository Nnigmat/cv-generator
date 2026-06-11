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

    // Build contact header matching CV layout
    var contactLines = [];
    if (lang === 'en') {
      var enItems = [];
      var addr = p.address ? (p.address.en || '') : '';
      if (addr) contactLines.push(esc(addr));
      if (p.phone) enItems.push('<a href="tel:' + esc(p.phone.replace(/\s+/g, '')) + '" style="color:#1a56db;text-decoration:none">' + esc(p.phone) + '</a>');
      if (p.email) enItems.push('<a href="mailto:' + esc(p.email) + '" style="color:#1a56db;text-decoration:none">' + esc(p.email) + '</a>');
      if (p.telegram) {
        var tgHref = /^https?:\/\//i.test(p.telegram) ? p.telegram : 'https://t.me/' + p.telegram.replace(/^@/, '');
        enItems.push('<a href="' + tgHref + '" style="color:#1a56db;text-decoration:none">Telegram</a>');
      }
      if (p.linkedin) {
        var liHref = /^https?:\/\//i.test(p.linkedin) ? p.linkedin : 'https://' + p.linkedin;
        enItems.push('<a href="' + liHref + '" style="color:#1a56db;text-decoration:none">LinkedIn</a>');
      }
      if (p.github) {
        var ghHref = /^https?:\/\//i.test(p.github) ? p.github : 'https://' + p.github;
        enItems.push('<a href="' + ghHref + '" style="color:#1a56db;text-decoration:none">GitHub</a>');
      }
      if (enItems.length) contactLines.push(enItems.join(' • '));
      var _hlRaw = p.headerLanguages || [];
      var _hlArr = Array.isArray(_hlRaw) ? _hlRaw : (_hlRaw[lang] || _hlRaw.en || []);
      var langLine = _hlArr.map(function (l) { return esc(l.name) + ': ' + esc(l.level); }).join(' • ');
      if (langLine) contactLines.push(langLine);
    } else {
      var deContact = [p.email, p.phone].filter(Boolean).map(function (v) {
        if (v === p.phone) return '<a href="tel:' + esc(v.replace(/\s+/g, '')) + '" style="color:inherit;text-decoration:none">' + esc(v) + '</a>';
        return esc(v);
      }).join(' | ');
      var deLinks = [p.linkedin, p.github].filter(Boolean).map(function (v) {
        var href = /^https?:\/\//i.test(v) ? v : 'https://' + v;
        return '<a href="' + href + '" style="color:inherit;text-decoration:none">' + esc(v) + '</a>';
      }).join(' | ');
      var deAddr = p.address ? (p.address[lang] || p.address.en || '') : '';
      if (deContact) contactLines.push(deContact);
      if (deLinks) contactLines.push(deLinks);
      if (deAddr) contactLines.push(esc(deAddr));
    }
    var contact = contactLines.join('<br>');

    var body = (cl.body ? (cl.body[lang] || '') : '').split('\n\n')
      .filter(function (t) { return t.trim(); })
      .map(function (para) { return '<p class="cl-para">' + md(para) + '</p>'; }).join('');

    var _today = new Date();
    var _dd = String(_today.getDate()).padStart(2, '0');
    var _mm = String(_today.getMonth() + 1).padStart(2, '0');
    var _yyyy = _today.getFullYear();
    var _months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var _monthsDE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    var date = lang === 'de'
      ? _dd + '. ' + _monthsDE[_today.getMonth()] + ' ' + _yyyy
      : _months[_today.getMonth()] + ' ' + _dd + ', ' + _yyyy;

    var html = '<div class="cl-wrap">'
      + '<div style="margin-bottom:24px"><div class="cl-sender-name">' + esc(p.name || '') + '</div>'
      + '<div class="cl-sender-contact">' + contact + '</div></div>'
      + '<div style="margin-bottom:14px">' + greeting + '</div>'
      + body
      + '<div style="margin-top:24px;font-size:9.5pt"><div>' + closing + '</div>'
      + '<div style="margin-top:8px;font-weight:600">' + esc(p.name || '') + (date ? '<span style="font-weight:400;margin-left:16px">' + esc(date) + '</span>' : '') + '</div></div>'
      + '</div>';

    document.getElementById('cl-preview').innerHTML = html;
  }

  return { render: render };
})();
