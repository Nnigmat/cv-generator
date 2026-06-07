(function () {
  var STATUS_OPTIONS = ['draft', 'sent', 'interview', 'rejected', 'offer'];
  var STATUS_LABELS = { draft: 'Draft', sent: 'Sent', interview: 'Interview', rejected: 'Rejected', offer: 'Offer' };

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function renderCards() {
    var grid = document.getElementById('cards-grid');
    var profiles = Store.getAll();
    if (profiles.length === 0) {
      grid.innerHTML = '<div class="empty-state">No profiles yet. Click "+ New Profile" to start.</div>';
      return;
    }
    grid.innerHTML = profiles.map(function (p) {
      var statusOpts = STATUS_OPTIONS.map(function (s) {
        return '<option value="' + s + '"' + (p.meta.status === s ? ' selected' : '') + '>' + STATUS_LABELS[s] + '</option>';
      }).join('');
      return '<div class="profile-card" data-id="' + p.id + '">'
        + '<div class="profile-card-title">' + (p.meta.company || 'Unnamed company') + '</div>'
        + '<div class="profile-card-position">' + (p.meta.position || 'No position') + '</div>'
        + '<select class="status-select" data-id="' + p.id + '">' + statusOpts + '</select>'
        + '<div class="profile-card-footer">'
        + '<span class="profile-card-date">' + formatDate(p.createdAt) + '</span>'
        + '<div class="card-actions">'
        + '<button class="btn btn-open" data-id="' + p.id + '">Open</button>'
        + '<button class="btn btn-delete" data-id="' + p.id + '" style="color:#c00;border-color:#f8d0d0">Delete</button>'
        + '</div></div></div>';
    }).join('');
  }

  document.getElementById('btn-new').addEventListener('click', function () {
    var p = Store.createEmpty();
    Store.save(p);
    window.location.href = 'builder.html?id=' + p.id;
  });

  document.getElementById('cards-grid').addEventListener('click', function (e) {
    var id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('btn-open')) {
      window.location.href = 'builder.html?id=' + id;
    }
    if (e.target.classList.contains('btn-delete')) {
      if (confirm('Delete this profile?')) { Store.remove(id); renderCards(); }
    }
  });

  document.getElementById('cards-grid').addEventListener('change', function (e) {
    if (e.target.classList.contains('status-select')) {
      var id = e.target.dataset.id;
      var p = Store.get(id);
      if (p) { p.meta.status = e.target.value; Store.save(p); }
    }
  });

  document.getElementById('import-json').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!data.id) data.id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        if (!data.createdAt) data.createdAt = new Date().toISOString();
        Store.save(data);
        renderCards();
      } catch (err) { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  renderCards();
})();
