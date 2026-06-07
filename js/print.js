var Print = (function () {
  var BASE_CSS = '<style>'
    + '@page{size:A4;margin:1.5cm}'
    + '*{box-sizing:border-box}'
    + 'body{margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#1a1a1a;line-height:1.45}'
    + 'a{color:#555;text-decoration:none}'
    + '.cv-wrap{display:flex;min-height:100vh}'
    + '.cv-sidebar{width:32%;background:#1e2d40;color:#e8edf3;padding:24px 18px}'
    + '.cv-sidebar-photo{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:4px;margin-bottom:18px;display:block}'
    + '.cv-sidebar-section{margin-bottom:18px}'
    + '.cv-sidebar-section-title{font-size:8pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8aaac8;margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid #2e3d52}'
    + '.cv-sidebar-tag{display:inline-block;background:#2e3d52;color:#e8edf3;border-radius:4px;padding:2px 7px;margin:2px 2px 2px 0;font-size:8.5pt}'
    + '.cv-sidebar-list{margin:0;padding:0;list-style:none}'
    + '.cv-sidebar-list li{font-size:9pt;margin-bottom:3px}'
    + '.cv-sidebar-text{font-size:9pt;line-height:1.55}'
    + '.cv-main{flex:1;padding:20px 22px}'
    + '.cv-name{font-size:20pt;font-weight:700;margin-bottom:4px}'
    + '.cv-contact{font-size:8.5pt;color:#555;line-height:1.7}'
    + '.cv-section{margin-bottom:10px}'
    + '.cv-section-title{font-size:11pt;font-weight:700;color:#0056b3;letter-spacing:.03em;margin-bottom:1px}'
    + '.cv-divider{border:none;border-top:0.5px solid #bbb;margin:1px 0 5px}'
    + '.cv-exp-header{display:flex;justify-content:space-between}'
    + '.cv-exp-period{font-size:8.5pt;color:#555;text-align:right;white-space:nowrap;flex-shrink:0;margin-left:10px}'
    + '.cv-exp-bullets{margin:4px 0 0;padding-left:14px}'
    + '.cv-exp-bullets li{font-size:9.5pt;margin-bottom:2px}'
    + '.cv-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}'
    + '.cl-wrap{font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#1a1a1a;line-height:1.55}'
    + '.cl-sender-name{font-size:16pt;font-weight:700;margin-bottom:5px}'
    + '.cl-sender-contact{font-size:9pt;color:#555;line-height:1.7}'
    + '.cl-para{font-size:9.5pt;margin:0 0 12px}'
    + '</style>';

  function openAndPrint(bodyHTML) {
    var win = window.open('', '_blank');
    if (!win) { alert('Allow popups for this page, then try again.'); return; }
    win.document.open();
    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8">' + BASE_CSS + '</head><body>' + bodyHTML + '</body></html>');
    win.document.close();
    setTimeout(function () { win.focus(); win.print(); }, 600);
  }

  function printCV(profile, lang) {
    openAndPrint(document.getElementById('cv-preview').innerHTML);
  }

  function printCL(profile, lang) {
    openAndPrint(document.getElementById('cl-preview').innerHTML);
  }

  return { printCV: printCV, printCL: printCL };
})();
