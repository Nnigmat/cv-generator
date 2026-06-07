var Store = (function () {
  var KEY = 'cv-builder-profiles';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function get(id) {
    return getAll().find(function (p) { return p.id === id; }) || null;
  }

  function save(profile) {
    var all = getAll();
    var idx = all.findIndex(function (p) { return p.id === profile.id; });
    if (idx >= 0) { all[idx] = profile; } else { all.push(profile); }
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  function remove(id) {
    var all = getAll().filter(function (p) { return p.id !== id; });
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  function createEmpty() {
    return {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      meta: { company: '', position: '', status: 'draft', lang: 'en' },
      personal: { name: '', email: '', phone: '', linkedin: '', github: '', address: '', photo: '', dateOfBirth: '', nationality: '', maritalStatus: '', signatureCity: '', signatureImage: '' },
      about: { en: '', de: '' },
      sidebarSections: [
        { id: 'skills', title: { en: 'Skills', de: 'Kenntnisse' }, type: 'tags', items: [] },
        { id: 'languages', title: { en: 'Languages', de: 'Sprachen' }, type: 'list', items: [] },
        { id: 'hobbies', title: { en: 'Hobbies', de: 'Hobbys' }, type: 'text', content: { en: '', de: '' } }
      ],
      experience: [],
      education: [],
      coverLetter: { date: { en: '', de: '' }, body: { en: '', de: '' } }
    };
  }

  return { getAll: getAll, get: get, save: save, remove: remove, createEmpty: createEmpty };
})();
