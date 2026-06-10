var RenderCV = (function () {
  var L10N = {
    en: { aboutMe: 'Summary', experience: 'Experience', education: 'Education' },
    de: { aboutMe: 'ÜBER MICH', experience: 'WERDEGANG', education: 'AUSBILDUNG' }
  };

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function md(text) {
    return esc(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  function renderSidebarSection(sec, lang, inline) {
    var title = esc(sec.title[lang] || sec.title.en || '');
    var body = '';
    if (sec.type === 'tags') {
      body = (sec.items || []).map(function (t) {
        return '<span class="cv-sidebar-tag">' + esc(t) + '</span>';
      }).join('');
    } else if (sec.type === 'list') {
      body = '<ul class="cv-sidebar-list">' + (sec.items || []).map(function (item) {
        var text = typeof item === 'object' ? (item[lang] || item.en || '') : item;
        return '<li>' + md(text) + '</li>';
      }).join('') + '</ul>';
    } else if (sec.type === 'text') {
      var content = sec.content ? (sec.content[lang] || sec.content.en || '') : '';
      body = '<div class="cv-sidebar-text">' + md(content) + '</div>';
    }
    if (inline) {
      return '<div class="cv-section"><div class="cv-section-title">' + title + '</div><hr class="cv-divider"/>' + body + '</div>';
    }
    return '<div class="cv-sidebar-section"><div class="cv-sidebar-section-title">' + title + '</div>' + body + '</div>';
  }

  function renderPersonalData(p) {
    var rows = [
      ['Geburtsdatum', p.dateOfBirth],
      ['Staatsangehörigkeit', p.nationality],
      ['Familienstand', p.maritalStatus]
    ].filter(function (r) { return r[1]; })
     .map(function (r) {
       return '<div class="cv-sidebar-personal-row"><span class="cv-sidebar-personal-label">' + esc(r[0]) + '</span> ' + esc(r[1]) + '</div>';
     }).join('');
    if (!rows) return '';
    return '<div class="cv-sidebar-section"><div class="cv-sidebar-section-title">Persönliche Daten</div>' + rows + '</div>';
  }

  function render(profile, lang) {
    var L = L10N[lang] || L10N.en;
    var p = profile.personal || {};
    var photoSrc = lang !== 'en' && p.photo && p.photo.startsWith('data:image/') ? p.photo : null;
    var photo = lang === 'en'
      ? ''
      : (photoSrc
          ? '<img class="cv-sidebar-photo" src="' + photoSrc + '" alt="photo" />'
          : '<div class="cv-sidebar-photo-placeholder">No photo</div>');

    var personalData = lang === 'de' ? renderPersonalData(p) : '';
    var sidebar = photo
      + personalData
      + (profile.sidebarSections || []).map(function (s) { return renderSidebarSection(s, lang, false); }).join('');

    var inlineSections = '';

    // DE layout: pipe-separated email | phone, then links
    var contact = [p.email, p.phone].filter(Boolean).map(function (v) {
      if (v === p.phone) return '<a href="tel:' + esc(v.replace(/\s+/g, '')) + '" style="color:inherit;text-decoration:none">' + esc(v) + '</a>';
      return esc(v);
    }).join(' | ');
    var links = [p.linkedin, p.github].filter(Boolean).map(function (v) {
      var href = /^https?:\/\//i.test(v) ? v : 'https://' + v;
      return '<a href="' + href + '" style="color:inherit;text-decoration:none">' + esc(v) + '</a>';
    }).join(' | ');

    // EN layout: bullet-separated contact line (phone • email • Telegram • LinkedIn • GitHub)
    var enContactItems = [];
    if (p.phone) enContactItems.push('<a href="tel:' + esc(p.phone.replace(/\s+/g, '')) + '" style="color:#1a56db;text-decoration:none">' + esc(p.phone) + '</a>');
    if (p.email) enContactItems.push('<a href="mailto:' + esc(p.email) + '" style="color:#1a56db;text-decoration:none">' + esc(p.email) + '</a>');
    if (p.telegram) {
      var tgHref = /^https?:\/\//i.test(p.telegram) ? p.telegram : 'https://t.me/' + p.telegram.replace(/^@/, '');
      enContactItems.push('<a href="' + tgHref + '" style="color:#1a56db;text-decoration:none">Telegram</a>');
    }
    if (p.linkedin) {
      var liHref = /^https?:\/\//i.test(p.linkedin) ? p.linkedin : 'https://' + p.linkedin;
      enContactItems.push('<a href="' + liHref + '" style="color:#1a56db;text-decoration:none">LinkedIn</a>');
    }
    if (p.github) {
      var ghHref = /^https?:\/\//i.test(p.github) ? p.github : 'https://' + p.github;
      enContactItems.push('<a href="' + ghHref + '" style="color:#1a56db;text-decoration:none">GitHub</a>');
    }
    var enContactLine = enContactItems.join(' • ');

    // Header languages line — per-lang array or legacy flat array
    var _hlRaw = p.headerLanguages || [];
    var _hlArr = Array.isArray(_hlRaw)
      ? _hlRaw
      : (_hlRaw[lang] || _hlRaw.en || []);
    var enLangLine = _hlArr.map(function (l) {
      return esc(l.name) + ': ' + esc(l.level);
    }).join(' • ');

    var expHtml = (profile.experience || []).map(function (job) {
      var title = job.title ? (job.title[lang] || job.title.en || '') : '';
      var duration = job.duration ? (job.duration[lang] || job.duration.en || '') : '';
      var companyDesc = job.companyDescription ? (job.companyDescription[lang] || job.companyDescription.en || '') : '';
      var bullets = (job.bullets ? (job.bullets[lang] || job.bullets.en || []) : [])
        .map(function (b) { return '<li>' + md(b) + '</li>'; }).join('');

      var companyTitle = (job.company ? esc(job.company) : '') + (job.company && title ? ' — ' + esc(title) : esc(title));
      if (lang === 'en') {
        return '<div style="margin-top:8px;margin-bottom:12px">'
          + '<div class="cv-exp-header"><div style="font-size:11pt;font-weight:700">' + companyTitle + '</div>'
          + '<div class="cv-exp-period">' + esc(job.period || '') + (duration ? '<br>(' + esc(duration) + ')' : '') + '</div></div>'
          + (companyDesc ? '<div style="font-size:9pt;margin-bottom:4px">' + md(companyDesc) + '</div>' : '')
          + '<ul class="cv-exp-bullets">' + bullets + '</ul></div>';
      }
      return '<div style="margin-top:6px;margin-bottom:10px">'
        + '<div class="cv-exp-header"><div style="font-weight:700">' + companyTitle + '</div>'
        + '<div class="cv-exp-period">' + esc(job.period || '') + (duration ? '<br>(' + esc(duration) + ')' : '') + '</div></div>'
        + (companyDesc ? '<div style="font-size:9pt;margin-bottom:4px">' + md(companyDesc) + '</div>' : '')
        + '<ul class="cv-exp-bullets">' + bullets + '</ul></div>';
    }).join('');

    var eduHtml = (profile.education || []).map(function (ed) {
      var degree = ed.degree ? (ed.degree[lang] || ed.degree.en || '') : '';
      var location = ed.location ? (ed.location[lang] || ed.location.en || '') : '';
      var eduBullets = (ed.bullets ? (ed.bullets[lang] || ed.bullets.en || []) : [])
        .map(function (b) { return '<li>' + md(b) + '</li>'; }).join('');

      if (lang === 'en') {
        return '<div style="font-size:9.5pt;margin-top:6px">'
          + '<div><strong>' + esc(ed.institution || '') + (location ? ', ' + esc(location) : '') + '</strong>'
          + (ed.period ? ' ' + esc(ed.period) : '') + '</div>'
          + '<div>' + md(degree) + '</div>'
          + (eduBullets ? '<ul class="cv-exp-bullets">' + eduBullets + '</ul>' : '')
          + '</div>';
      }
      return '<div style="font-size:9.5pt;margin-top:4px"><strong>' + esc(ed.institution || '') + '</strong><br>'
        + md(degree) + '<br><em style="color:#555">' + esc(location) + (ed.period ? ' · ' + esc(ed.period) : '') + '</em></div>';
    }).join('');

    var signatureHtml = '';
    if (lang === 'de' && p.signatureCity) {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      var sigLine = p.signatureImage
        ? '<img src="' + p.signatureImage + '" style="height:40px;display:block;margin-bottom:2px" alt="Unterschrift">'
        : '_______________<br>';
      signatureHtml = '<div class="cv-signature">'
        + esc(p.signatureCity) + ', ' + dd + '.' + mm + '.' + yyyy
        + '<br><br>' + sigLine + esc(p.name || '')
        + '</div>';
    }

    var wrapClass = lang === 'en' ? 'cv-wrap cv-wrap--linear' : 'cv-wrap';

    var enHeader = '';
    if (lang === 'en') {
      var nameTitle = esc(p.name || '') + (p.title ? ', ' + esc(p.title) : '');
      var ageLoc = [p.age ? p.age + ' years old' : '', p.address ? esc(typeof p.address === 'object' ? (p.address.en || '') : p.address) : ''].filter(Boolean).join(' • ');
      enHeader = '<div class="cv-name">' + nameTitle + '</div>'
        + (ageLoc ? '<div class="cv-contact">' + ageLoc + '</div>' : '')
        + (enContactLine ? '<div class="cv-contact">' + enContactLine + '</div>' : '')
        + (enLangLine ? '<div class="cv-contact">' + enLangLine + '</div>' : '');
    }

    var html = '<div class="' + wrapClass + '">'
      + (lang !== 'en' ? '<div class="cv-sidebar">' + sidebar + '</div>' : '')
      + '<div class="cv-main">'
      + (lang === 'en' ? enHeader
        : '<div class="cv-name">' + esc(p.name || '') + '</div>'
        + (contact ? '<div class="cv-contact">' + contact + '</div>' : '')
        + (links ? '<div class="cv-contact">' + links + '</div>' : '')
        + (p.address ? '<div class="cv-contact">' + esc(typeof p.address === 'object' ? (p.address[lang] || p.address.en || '') : p.address) + '</div>' : '')
      )
      + '<div class="cv-section" style="margin-top:12px"><div class="cv-section-title">' + L.aboutMe + '</div><hr class="cv-divider"/>'
      + '<div style="font-size:9.5pt">' + md(profile.about ? (profile.about[lang] || '') : '') + '</div></div>'
      + (expHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.experience + '</div><hr class="cv-divider"/>' + expHtml + '</div>' : '')
      + (eduHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.education + '</div><hr class="cv-divider"/>' + eduHtml + '</div>' : '')
      + inlineSections
      + signatureHtml
      + '</div></div>';

    document.getElementById('cv-preview').innerHTML = html;
  }

  return { render: render };
})();
