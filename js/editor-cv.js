var EditorCV = (function () {
  var _profile, _lang, _onChange;

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

  function buildPersonal(container) {
    container.appendChild(sectionLabel('Personal Info'));
    var grid = el('div', { className: 'field-grid-2' });
    var fields = [
      ['Name', 'name'], ['Phone', 'phone'], ['Email', 'email'],
      ['Telegram', 'telegram'], ['LinkedIn', 'linkedin'], ['GitHub', 'github']
    ];
    fields.forEach(function (pair) {
      grid.appendChild(field(pair[0], _profile.personal[pair[1]], function (v) {
        _profile.personal[pair[1]] = v; _onChange();
      }));
    });
    container.appendChild(grid);

    container.appendChild(sectionLabel('Address'));
    var addrGrid = el('div', { className: 'field-grid-2' });
    var addr = _profile.personal.address;
    if (typeof addr === 'string') { addr = { en: addr, de: addr }; _profile.personal.address = addr; }
    if (!addr || typeof addr !== 'object') { addr = { en: '', de: '' }; _profile.personal.address = addr; }
    addrGrid.appendChild(field('English', addr.en, function (v) { _profile.personal.address.en = v; _onChange(); }));
    addrGrid.appendChild(field('Deutsch', addr.de, function (v) { _profile.personal.address.de = v; _onChange(); }));
    container.appendChild(addrGrid);

    if (_lang === 'de') {
      container.appendChild(sectionLabel('Persönliche Daten'));
      var deGrid = el('div', { className: 'field-grid-2' });
      var deFields = [
        ['Geburtsdatum', 'dateOfBirth'],
        ['Staatsangehörigkeit', 'nationality'],
        ['Familienstand', 'maritalStatus']
      ];
      deFields.forEach(function (pair) {
        deGrid.appendChild(field(pair[0], _profile.personal[pair[1]], function (v) {
          _profile.personal[pair[1]] = v; _onChange();
        }));
      });
      container.appendChild(deGrid);
    }
  }

  function buildPhoto(container) {
    container.appendChild(sectionLabel('Photo'));
    var wrap = el('div', { className: 'photo-upload-wrap' });
    var thumb = _profile.personal.photo && _profile.personal.photo.startsWith('data:image/')
      ? el('img', { className: 'photo-thumb', src: _profile.personal.photo, alt: 'photo' })
      : el('div', { className: 'photo-thumb-placeholder' }, 'No photo');
    wrap.appendChild(thumb);
    var fileInput = el('input', { type: 'file', accept: 'image/*' });
    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        _profile.personal.photo = ev.target.result;
        _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      };
      reader.readAsDataURL(file);
    });
    wrap.appendChild(fileInput);
    container.appendChild(wrap);
  }

  function buildAbout(container) {
    container.appendChild(sectionLabel('About Me — ' + _lang.toUpperCase()));
    container.appendChild(field(null, _profile.about[_lang], function (v) {
      _profile.about[_lang] = v; _onChange();
    }, { multi: true, rows: 4 }));
  }

  function buildSidebar(container) {
    container.appendChild(sectionLabel('Sidebar Sections'));
    var list = el('div');
    (_profile.sidebarSections || []).forEach(function (sec, idx) {
      var item = el('div', { className: 'dynamic-item' });
      var actions = el('div', { className: 'dynamic-item-actions' });
      var delBtn = el('button', { className: 'btn-icon', title: 'Delete' }, '🗑');
      delBtn.addEventListener('click', function () {
        _profile.sidebarSections.splice(idx, 1);
        _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      actions.appendChild(delBtn);
      item.appendChild(actions);
      item.appendChild(field('Title', sec.title[_lang] || sec.title.en || '', function (v) {
        sec.title[_lang] = v; _onChange();
      }));
      var typeWrap = el('div', { className: 'field-wrap' });
      typeWrap.appendChild(el('label', { className: 'field-label' }, 'Type'));
      var typeSelect = el('select', { className: 'field-input' },
        '<option value="tags"' + (sec.type === 'tags' ? ' selected' : '') + '>Tags</option>'
        + '<option value="list"' + (sec.type === 'list' ? ' selected' : '') + '>List</option>'
        + '<option value="text"' + (sec.type === 'text' ? ' selected' : '') + '>Text</option>');
      typeSelect.addEventListener('change', function () {
        sec.type = typeSelect.value; _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      typeWrap.appendChild(typeSelect);
      item.appendChild(typeWrap);

      if (sec.type === 'tags' || sec.type === 'list') {
        var itemsVal = sec.type === 'tags'
          ? (sec.items || []).join('\n')
          : (sec.items || []).map(function (i) { return typeof i === 'object' ? (i[_lang] || i.en || '') : i; }).join('\n');
        var hint = sec.type === 'tags' ? 'One tag per line' : 'One item per line';
        item.appendChild(field('Items', itemsVal, function (v) {
          var lines = v.split('\n');
          if (sec.type === 'tags') { sec.items = lines; }
          else { sec.items = lines.map(function (l) { var o = {}; o[_lang] = l; return o; }); }
          _onChange();
        }, { multi: true, rows: 4, hint: hint }));
      } else {
        item.appendChild(field('Content', sec.content ? (sec.content[_lang] || '') : '', function (v) {
          if (!sec.content) sec.content = {};
          sec.content[_lang] = v; _onChange();
        }, { multi: true, rows: 4 }));
      }
      list.appendChild(item);
    });

    var addBtn = el('button', { className: 'btn-add' }, '+ Add Section');
    addBtn.addEventListener('click', function () {
      _profile.sidebarSections.push({
        id: 's' + Date.now(),
        title: { en: 'New Section', de: 'Neuer Abschnitt' },
        type: 'list',
        items: []
      });
      _onChange();
      build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
    });
    list.appendChild(addBtn);
    container.appendChild(list);
  }

  function buildExperience(container) {
    container.appendChild(sectionLabel('Experience — ' + _lang.toUpperCase()));
    var list = el('div');
    (_profile.experience || []).forEach(function (job, idx) {
      var item = el('div', { className: 'dynamic-item' });
      var actions = el('div', { className: 'dynamic-item-actions' });
      if (idx > 0) {
        var upBtn = el('button', { className: 'btn-icon', title: 'Move up' }, '↑');
        upBtn.addEventListener('click', function () {
          var tmp = _profile.experience[idx - 1];
          _profile.experience[idx - 1] = _profile.experience[idx];
          _profile.experience[idx] = tmp;
          _onChange();
          build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
        });
        actions.appendChild(upBtn);
      }
      var delBtn = el('button', { className: 'btn-icon', title: 'Delete' }, '🗑');
      delBtn.addEventListener('click', function () {
        _profile.experience.splice(idx, 1);
        _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      actions.appendChild(delBtn);
      item.appendChild(actions);

      item.appendChild(field('Job Title', job.title ? (job.title[_lang] || '') : '', function (v) {
        if (!job.title) job.title = {}; job.title[_lang] = v; _onChange();
      }));
      var grid3 = el('div', { className: 'field-grid-3' });
      grid3.appendChild(field('Company', job.company || '', function (v) { job.company = v; _onChange(); }));
      grid3.appendChild(field('Period', job.period || '', function (v) { job.period = v; _onChange(); }));
      grid3.appendChild(field('Duration', job.duration ? (job.duration[_lang] || '') : '', function (v) {
        if (!job.duration) job.duration = {}; job.duration[_lang] = v; _onChange();
      }));
      item.appendChild(grid3);
      item.appendChild(field('Company Description', job.companyDescription ? (job.companyDescription[_lang] || '') : '', function (v) {
        if (!job.companyDescription) job.companyDescription = {}; job.companyDescription[_lang] = v; _onChange();
      }, { multi: true, rows: 2, hint: 'Short company context · **text** for bold' }));
      item.appendChild(field('Bullets', (job.bullets ? (job.bullets[_lang] || []) : []).join('\n'), function (v) {
        if (!job.bullets) job.bullets = {};
        job.bullets[_lang] = v.split('\n'); _onChange();
      }, { multi: true, rows: 5, hint: 'One per line · **text** for bold' }));
      list.appendChild(item);
    });

    var addBtn = el('button', { className: 'btn-add' }, '+ Add Job');
    addBtn.addEventListener('click', function () {
      _profile.experience.push({
        id: 'e' + Date.now(),
        title: { en: '', de: '' }, company: '', period: '',
        duration: { en: '', de: '' }, bullets: { en: [], de: [] }
      });
      _onChange();
      build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
    });
    list.appendChild(addBtn);
    container.appendChild(list);
  }

  function buildEducation(container) {
    container.appendChild(sectionLabel('Education'));
    var list = el('div');
    (_profile.education || []).forEach(function (ed, idx) {
      var item = el('div', { className: 'dynamic-item' });
      var actions = el('div', { className: 'dynamic-item-actions' });
      var delBtn = el('button', { className: 'btn-icon' }, '🗑');
      delBtn.addEventListener('click', function () {
        _profile.education.splice(idx, 1); _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      actions.appendChild(delBtn);
      item.appendChild(actions);
      item.appendChild(field('Institution', ed.institution || '', function (v) { ed.institution = v; _onChange(); }));
      var grid2 = el('div', { className: 'field-grid-2' });
      grid2.appendChild(field('Degree', ed.degree ? (ed.degree[_lang] || '') : '', function (v) {
        if (!ed.degree) ed.degree = {}; ed.degree[_lang] = v; _onChange();
      }));
      grid2.appendChild(field('Period', ed.period || '', function (v) { ed.period = v; _onChange(); }));
      item.appendChild(grid2);
      item.appendChild(field('Location', ed.location ? (ed.location[_lang] || '') : '', function (v) {
        if (!ed.location) ed.location = {}; ed.location[_lang] = v; _onChange();
      }));
      item.appendChild(field('Bullets', (ed.bullets ? (ed.bullets[_lang] || []) : []).join('\n'), function (v) {
        if (!ed.bullets) ed.bullets = {};
        ed.bullets[_lang] = v.split('\n'); _onChange();
      }, { multi: true, rows: 3 }));
      list.appendChild(item);
    });
    var addBtn = el('button', { className: 'btn-add' }, '+ Add Education');
    addBtn.addEventListener('click', function () {
      _profile.education.push({ id: 'ed' + Date.now(), institution: '', degree: { en: '', de: '' }, location: { en: '', de: '' }, period: '' });
      _onChange(); build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
    });
    list.appendChild(addBtn);
    container.appendChild(list);
  }

  function buildSignature(container) {
    container.appendChild(sectionLabel('Unterschrift'));
    container.appendChild(field('Stadt', _profile.personal.signatureCity, function (v) {
      _profile.personal.signatureCity = v; _onChange();
    }, { hint: 'Wird in der Unterschrift verwendet' }));

    var imgWrap = el('div', { className: 'field-row' });
    var lbl = el('label', { className: 'field-label' }, 'Unterschrift-Bild');
    imgWrap.appendChild(lbl);
    var inner = el('div', { style: 'display:flex;flex-direction:column;gap:6px' });

    if (_profile.personal.signatureImage) {
      var preview = el('img', { src: _profile.personal.signatureImage, style: 'height:40px;border:1px solid #ddd;border-radius:4px;padding:2px' });
      inner.appendChild(preview);
      var removeBtn = el('button', { className: 'btn-remove', style: 'align-self:flex-start' }, 'Entfernen');
      removeBtn.addEventListener('click', function () {
        _profile.personal.signatureImage = ''; _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      inner.appendChild(removeBtn);
    } else {
      var fileInput = el('input', { type: 'file', accept: 'image/*' });
      fileInput.addEventListener('change', function () {
        var file = fileInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          _profile.personal.signatureImage = e.target.result; _onChange();
          build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
        };
        reader.readAsDataURL(file);
      });
      inner.appendChild(fileInput);
    }

    imgWrap.appendChild(inner);
    container.appendChild(imgWrap);
  }

  function buildHeaderLanguages(container) {
    container.appendChild(sectionLabel('Languages — ' + _lang.toUpperCase()));

    // Migrate legacy flat array to per-lang object
    var hl = _profile.personal.headerLanguages;
    if (!hl || typeof hl !== 'object' || Array.isArray(hl)) {
      _profile.personal.headerLanguages = { en: Array.isArray(hl) ? hl : [], de: [] };
      _onChange();
    }
    var langArr = _profile.personal.headerLanguages[_lang] || [];
    _profile.personal.headerLanguages[_lang] = langArr;

    var list = el('div');

    langArr.forEach(function (entry, idx) {
      var item = el('div', { className: 'dynamic-item' });
      var actions = el('div', { className: 'dynamic-item-actions' });
      var delBtn = el('button', { className: 'btn-icon', title: 'Delete' }, '🗑');
      delBtn.addEventListener('click', function () {
        langArr.splice(idx, 1); _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      actions.appendChild(delBtn);
      item.appendChild(actions);
      var grid = el('div', { className: 'field-grid-2' });
      grid.appendChild(field('Language', entry.name, function (v) { entry.name = v; _onChange(); }));
      grid.appendChild(field('Level', entry.level, function (v) { entry.level = v; _onChange(); }));
      item.appendChild(grid);
      list.appendChild(item);
    });

    var addBtn = el('button', { className: 'btn-add' }, '+ Add Language');
    addBtn.addEventListener('click', function () {
      langArr.push({ name: '', level: '' }); _onChange();
      build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
    });
    list.appendChild(addBtn);
    container.appendChild(list);
  }

  function buildVacancy(container) {
    container.appendChild(sectionLabel('Vacancy'));
    if (!_profile.vacancy) { _profile.vacancy = { url: '', text: '' }; }
    container.appendChild(field('Job URL', _profile.vacancy.url, function (v) {
      _profile.vacancy.url = v; _onChange();
    }));
    container.appendChild(field('Job Description', _profile.vacancy.text, function (v) {
      _profile.vacancy.text = v; _onChange();
    }, { multi: true, rows: 8 }));
  }

  function build(container, profile, lang, onChange) {
    _profile = profile; _lang = lang; _onChange = onChange;
    container.innerHTML = '';
    var wrap = el('div', { className: 'panel-card' });
    buildPersonal(wrap);
    buildPhoto(wrap);
    buildAbout(wrap);
    buildHeaderLanguages(wrap);
    buildSidebar(wrap);
    buildExperience(wrap);
    buildEducation(wrap);
    if (_lang === 'de') { buildSignature(wrap); }
    buildVacancy(wrap);
    container.appendChild(wrap);
  }

  return { build: build };
})();
