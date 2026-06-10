var RenderCV = (function () {
  var L10N = {
    en: { aboutMe: 'ABOUT ME', experience: 'CAREER', education: 'EDUCATION' },
    de: { aboutMe: 'ÜBER MICH', experience: 'WERDEGANG', education: 'AUSBILDUNG' }
  };

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bold(text) {
    return esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
        return '<li>' + esc(text) + '</li>';
      }).join('') + '</ul>';
    } else if (sec.type === 'text') {
      var content = sec.content ? (sec.content[lang] || sec.content.en || '') : '';
      body = '<div class="cv-sidebar-text">' + esc(content) + '</div>';
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

    var inlineSections = lang === 'en'
      ? (profile.sidebarSections || []).map(function (s) { return renderSidebarSection(s, lang, true); }).join('')
      : '';

    var contact = [p.email, p.phone].filter(Boolean).map(function (v) {
      if (v === p.phone) return '<a href="tel:' + esc(v.replace(/\s+/g, '')) + '" style="color:inherit;text-decoration:none">' + esc(v) + '</a>';
      return esc(v);
    }).join(' | ');
    var links = [p.linkedin, p.github].filter(Boolean).map(function (v) {
      var href = /^https?:\/\//i.test(v) ? v : 'https://' + v;
      return '<a href="' + href + '" style="color:inherit;text-decoration:none">' + esc(v) + '</a>';
    }).join(' | ');

    var expHtml = (profile.experience || []).map(function (job) {
      var title = job.title ? (job.title[lang] || job.title.en || '') : '';
      var duration = job.duration ? (job.duration[lang] || job.duration.en || '') : '';
      var bullets = (job.bullets ? (job.bullets[lang] || job.bullets.en || []) : [])
        .map(function (b) { return '<li>' + bold(b) + '</li>'; }).join('');
      return '<div style="margin-top:6px;margin-bottom:10px">'
        + '<div class="cv-exp-header"><div><strong>' + esc(title) + '</strong><br>'
        + '<em style="font-size:9pt;color:#555">' + esc(job.company || '') + '</em></div>'
        + '<div class="cv-exp-period">' + esc(job.period || '') + (duration ? '<br>(' + esc(duration) + ')' : '') + '</div></div>'
        + '<ul class="cv-exp-bullets">' + bullets + '</ul></div>';
    }).join('');

    var eduHtml = (profile.education || []).map(function (ed) {
      var degree = ed.degree ? (ed.degree[lang] || ed.degree.en || '') : '';
      var location = ed.location ? (ed.location[lang] || ed.location.en || '') : '';
      return '<div style="font-size:9.5pt;margin-top:4px"><strong>' + esc(ed.institution || '') + '</strong><br>'
        + esc(degree) + '<br><em style="color:#555">' + esc(location) + (ed.period ? ' · ' + esc(ed.period) : '') + '</em></div>';
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
    var html = '<div class="' + wrapClass + '">'
      + (lang !== 'en' ? '<div class="cv-sidebar">' + sidebar + '</div>' : '')
      + '<div class="cv-main">'
      + '<div class="cv-name">' + esc(p.name || '') + '</div>'
      + (contact ? '<div class="cv-contact">' + contact + '</div>' : '')
      + (links ? '<div class="cv-contact">' + links + '</div>' : '')
      + (p.address ? '<div class="cv-contact">' + esc(typeof p.address === 'object' ? (p.address[lang] || p.address.en || '') : p.address) + '</div>' : '')
      + '<div class="cv-section" style="margin-top:12px"><div class="cv-section-title">' + L.aboutMe + '</div><hr class="cv-divider"/>'
      + '<div style="font-size:9.5pt">' + esc(profile.about ? (profile.about[lang] || '') : '') + '</div></div>'
      + (expHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.experience + '</div><hr class="cv-divider"/>' + expHtml + '</div>' : '')
      + (eduHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.education + '</div><hr class="cv-divider"/>' + eduHtml + '</div>' : '')
      + inlineSections
      + signatureHtml
      + '</div></div>';

    document.getElementById('cv-preview').innerHTML = html;
  }

  return { render: render };
})();
