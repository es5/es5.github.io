function addTimestamp() {
  var link = document.createElement("A"),
      script = document.createElement('SCRIPT');
  script.src = "http://github.com/api/v2/json/repos/show/sideshowbarker/es5-spec?callback=jsonp";
  link.href = "https://github.com/sideshowbarker/es5-spec";
  document.body.appendChild(script);
  document.getElementById("timestamp").appendChild(link);
  window.jsonp = function (data) {
    link.textContent = "Last updated: " + data.repository.pushed_at.substring(0, 10);
  };
}
window.addEventListener('load', addTimestamp(), false);
