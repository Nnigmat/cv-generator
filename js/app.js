(function () {
  // Read profile id from URL
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var profile = id ? Store.get(id) : null;
  if (!profile) { window.location.href = 'index.html'; return; }

  var tab = 'cv';       // 'cv' | 'cover'
  var mode = 'preview'; // 'preview' | 'edit'
  var lang = profile.meta.lang || 'en';

  var debounceTimer;
  function persist() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { Store.save(profile); }, 300);
  }

  function rerender() {
    if (tab === 'cv') {
      RenderCV.render(profile, lang);
    } else {
      RenderCL.render(profile, lang);
    }
  }

  function onChange() { persist(); rerender(); }

  function rebuildEditor() {
    var panel = document.getElementById('editor-panel');
    if (tab === 'cv') {
      EditorCV.build(panel, profile, lang, onChange);
    } else {
      EditorCL.build(panel, profile, lang, onChange);
    }
  }

  function setTab(newTab) {
    tab = newTab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.getElementById('cv-preview').style.display = tab === 'cv' ? '' : 'none';
    document.getElementById('cl-preview').style.display = tab === 'cover' ? '' : 'none';
    if (mode === 'edit') rebuildEditor();
    rerender();
  }

  function setLang(newLang) {
    lang = newLang;
    profile.meta.lang = lang;
    ['en', 'de'].forEach(function (l) {
      document.getElementById('btn-lang-' + l).classList.toggle('active', l === lang);
    });
    if (mode === 'edit') rebuildEditor();
    rerender();
  }

  function setMode(newMode) {
    mode = newMode;
    document.getElementById('btn-preview').classList.toggle('active', mode === 'preview');
    document.getElementById('btn-edit').classList.toggle('active', mode === 'edit');
    var panel = document.getElementById('editor-panel');
    if (mode === 'edit') {
      panel.style.display = '';
      rebuildEditor();
    } else {
      panel.style.display = 'none';
    }
  }

  // Toolbar wiring
  document.querySelectorAll('.tab-btn').forEach(function (b) {
    b.addEventListener('click', function () { setTab(b.dataset.tab); });
  });
  document.getElementById('btn-lang-en').addEventListener('click', function () { setLang('en'); });
  document.getElementById('btn-lang-de').addEventListener('click', function () { setLang('de'); });
  document.getElementById('btn-preview').addEventListener('click', function () { setMode('preview'); });
  document.getElementById('btn-edit').addEventListener('click', function () { setMode('edit'); });

  document.getElementById('btn-save-cv').addEventListener('click', function () { Print.printCV(profile, lang); });
  document.getElementById('btn-save-cl').addEventListener('click', function () { Print.printCL(profile, lang); });

  document.getElementById('btn-export').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (profile.meta.company || 'cv') + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById('import-json').addEventListener('change', function (e) {
    var file = e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        data.id = profile.id; // keep same id
        Object.assign(profile, data);
        Store.save(profile);
        if (mode === 'edit') rebuildEditor();
        rerender();
      } catch (err) { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Initial render
  rerender();
})();
