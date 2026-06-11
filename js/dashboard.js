(function () {
  var STATUS_OPTIONS = ['draft', 'sent', 'interview', 'rejected', 'offer'];
  var STATUS_LABELS = { draft: 'Draft', sent: 'Sent', interview: 'Interview', rejected: 'Rejected', offer: 'Offer' };

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function renderHistory(history) {
    if (!history || history.length === 0) return '';
    return '<div class="status-history">'
      + history.map(function (h) {
        return '<div class="status-history-item">'
          + '<span class="status-history-label">' + esc(STATUS_LABELS[h.status] || h.status) + '</span>'
          + '<span class="status-history-date">' + formatDate(h.date) + '</span>'
          + '</div>';
      }).join('')
      + '</div>';
  }

  function getSortedProfiles() {
    var profiles = Store.getAll();
    var sort = document.getElementById('sort-select').value;
    profiles = profiles.slice();
    if (sort === 'created-desc') {
      profiles.sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
    } else if (sort === 'created-asc') {
      profiles.sort(function (a, b) { return (a.createdAt || '').localeCompare(b.createdAt || ''); });
    } else if (sort === 'company-asc') {
      profiles.sort(function (a, b) { return (a.meta.company || '').localeCompare(b.meta.company || ''); });
    } else if (sort === 'company-desc') {
      profiles.sort(function (a, b) { return (b.meta.company || '').localeCompare(a.meta.company || ''); });
    } else if (sort === 'status') {
      var order = { offer: 0, interview: 1, sent: 2, draft: 3, rejected: 4 };
      profiles.sort(function (a, b) {
        return (order[a.meta.status] ?? 99) - (order[b.meta.status] ?? 99);
      });
    }
    return profiles;
  }

  function renderCards() {
    var grid = document.getElementById('cards-grid');
    var profiles = getSortedProfiles();
    if (profiles.length === 0) {
      grid.innerHTML = '<div class="empty-state">No profiles yet. Click "+ New Profile" to start.</div>';
      return;
    }
    grid.innerHTML = profiles.map(function (p) {
      var statusOpts = STATUS_OPTIONS.map(function (s) {
        return '<option value="' + s + '"' + (p.meta.status === s ? ' selected' : '') + '>' + STATUS_LABELS[s] + '</option>';
      }).join('');
      return '<div class="profile-card" data-id="' + p.id + '">'
        + '<div class="profile-card-title">' + esc(p.meta.company || 'Unnamed company') + '</div>'
        + '<div class="profile-card-position">' + esc(p.meta.position || 'No position') + '</div>'
        + '<div class="status-row">'
        + '<select class="status-select" data-id="' + p.id + '">' + statusOpts + '</select>'
        + '</div>'
        + renderHistory(p.meta.statusHistory)
        + '<div class="profile-card-footer">'
        + '<span class="profile-card-date">Created: ' + formatDate(p.createdAt) + '</span>'
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
      if (p) {
        p.meta.status = e.target.value;
        if (!p.meta.statusHistory) p.meta.statusHistory = [];
        p.meta.statusHistory.push({ status: e.target.value, date: new Date().toISOString() });
        Store.save(p);
        renderCards();
      }
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

  document.getElementById('sort-select').addEventListener('change', renderCards);

  renderCards();
})();
