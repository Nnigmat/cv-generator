var EditorCL = (function () {
  function el(tag, attrs, inner) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'className') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (inner !== undefined) e.innerHTML = inner;
    return e;
  }

  function field(label, value, onInput, opts) {
    opts = opts || {};
    var wrap = el('div', { className: 'field-wrap' });
    if (label) wrap.appendChild(el('label', { className: 'field-label' }, label));
    if (opts.hint) wrap.appendChild(el('div', { className: 'field-hint' }, opts.hint));
    var input;
    if (opts.multi) {
      input = el('textarea', { className: 'field-input', rows: opts.rows || 3 });
    } else {
      input = el('input', { className: 'field-input', type: 'text' });
    }
    input.value = value || '';
    input.addEventListener('input', function () { onInput(input.value); });
    wrap.appendChild(input);
    return wrap;
  }

  function sectionLabel(text) { return el('div', { className: 'section-label' }, text); }

  function build(container, profile, lang, onChange) {
    container.innerHTML = '';
    var wrap = el('div', { className: 'panel-card' });
    var meta = profile.meta || {};
    var cl = profile.coverLetter || {};

    wrap.appendChild(sectionLabel('Profile'));
    var grid2 = el('div', { className: 'field-grid-2' });
    grid2.appendChild(field('Company', meta.company || '', function (v) { profile.meta.company = v; onChange(); }));
    grid2.appendChild(field('Position', meta.position || '', function (v) { profile.meta.position = v; onChange(); }));
    wrap.appendChild(grid2);

    wrap.appendChild(field('Date (' + lang.toUpperCase() + ')', cl.date ? (cl.date[lang] || '') : '', function (v) {
      if (!profile.coverLetter.date) profile.coverLetter.date = {};
      profile.coverLetter.date[lang] = v; onChange();
    }));

    wrap.appendChild(sectionLabel('Letter Body — ' + lang.toUpperCase()));
    wrap.appendChild(el('div', { className: 'field-hint' }, 'Separate paragraphs with a blank line'));
    var bodyInput = el('textarea', { className: 'field-input', rows: 16 });
    bodyInput.value = cl.body ? (cl.body[lang] || '') : '';
    bodyInput.addEventListener('input', function () {
      if (!profile.coverLetter.body) profile.coverLetter.body = {};
      profile.coverLetter.body[lang] = bodyInput.value; onChange();
    });
    wrap.appendChild(bodyInput);

    container.appendChild(wrap);
  }

  return { build: build };
})();
