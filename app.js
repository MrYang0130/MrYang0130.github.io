(function () {
  "use strict";

  var button = document.getElementById("exportPdf");
  if (!button) {
    return;
  }

  var originalTitle = document.title;

  button.addEventListener("click", function () {
    originalTitle = document.title;
    document.title = document.body.dataset.pdfName || originalTitle;
    window.print();
  });

  function restoreTitle() {
    document.title = originalTitle;
  }

  window.addEventListener("afterprint", restoreTitle);
  window.addEventListener("focus", restoreTitle);
})();
