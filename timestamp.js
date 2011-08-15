function addTimestamp() {
  var link = document.createElement("A"),
      d = new Date(document.lastModified);
  // script.src = "http://github.com/api/v2/json/repos/show/es5/es5.github.com?callback=jsonp";
  link.href = "https://github.com/es5/es5.github.com/commits/";
  document.getElementById("timestamp").appendChild(link);
  link.textContent = "Last\u00A0updated:\u00A0" + d.toISOString().substring(0, 10);
}
addTimestamp();
