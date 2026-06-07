var RenderCV = (function () {
  var L10N = {
    en: { aboutMe: 'ABOUT ME', experience: 'EXPERIENCE', education: 'EDUCATION' },
    de: { aboutMe: 'ÜBER MICH', experience: 'BERUFSERFAHRUNG', education: 'AUSBILDUNG' }
  };

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bold(text) {
    return esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function renderSidebarSection(sec, lang) {
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
    return '<div class="cv-sidebar-section"><div class="cv-sidebar-section-title">' + title + '</div>' + body + '</div>';
  }

  function render(profile, lang) {
    var L = L10N[lang] || L10N.en;
    var p = profile.personal || {};
    var photo = p.photo
      ? '<img class="cv-sidebar-photo" src="' + p.photo + '" alt="photo" />'
      : '<div class="cv-sidebar-photo-placeholder">No photo</div>';

    var sidebar = photo
      + (profile.sidebarSections || []).map(function (s) { return renderSidebarSection(s, lang); }).join('');

    var contact = [p.email, p.phone].filter(Boolean).map(function (v) { return esc(v); }).join(' | ');
    var links = [p.linkedin, p.github].filter(Boolean).map(function (v) { return esc(v); }).join(' | ');

    var expHtml = (profile.experience || []).map(function (job) {
      var title = job.title ? (job.title[lang] || job.title.en || '') : '';
      var duration = job.duration ? (job.duration[lang] || job.duration.en || '') : '';
      var bullets = (job.bullets ? (job.bullets[lang] || job.bullets.en || []) : [])
        .map(function (b) { return '<li>' + bold(b) + '</li>'; }).join('');
      return '<div style="margin-top:6px;margin-bottom:10px">'
        + '<div class="cv-exp-header"><div><strong>' + esc(title) + '</strong><br>'
        + '<em style="font-size:9pt;color:#555">' + esc(job.company || '') + '</em></div>'
        + '<div class="cv-exp-period">' + esc(job.period || '') + '<br>(' + esc(duration) + ')</div></div>'
        + '<ul class="cv-exp-bullets">' + bullets + '</ul></div>';
    }).join('');

    var eduHtml = (profile.education || []).map(function (ed) {
      var degree = ed.degree ? (ed.degree[lang] || ed.degree.en || '') : '';
      var location = ed.location ? (ed.location[lang] || ed.location.en || '') : '';
      return '<div style="font-size:9.5pt;margin-top:4px"><strong>' + esc(ed.institution || '') + '</strong><br>'
        + esc(degree) + '<br><em style="color:#555">' + esc(location) + (ed.period ? ' · ' + esc(ed.period) : '') + '</em></div>';
    }).join('');

    var html = '<div class="cv-wrap">'
      + '<div class="cv-sidebar">' + sidebar + '</div>'
      + '<div class="cv-main">'
      + '<div class="cv-name">' + esc(p.name || '') + '</div>'
      + (contact ? '<div class="cv-contact">' + contact + '</div>' : '')
      + (links ? '<div class="cv-contact">' + links + '</div>' : '')
      + (p.address ? '<div class="cv-contact">' + esc(p.address) + '</div>' : '')
      + '<div class="cv-section" style="margin-top:12px"><div class="cv-section-title">' + L.aboutMe + '</div><hr class="cv-divider"/>'
      + '<div style="font-size:9.5pt">' + esc(profile.about ? (profile.about[lang] || '') : '') + '</div></div>'
      + (expHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.experience + '</div><hr class="cv-divider"/>' + expHtml + '</div>' : '')
      + (eduHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.education + '</div><hr class="cv-divider"/>' + eduHtml + '</div>' : '')
      + '</div></div>';

    document.getElementById('cv-preview').innerHTML = html;
  }

  return { render: render };
})();
