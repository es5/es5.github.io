function addTimeStamp() {
  var
    span = document.getElementById("timestamp"),
    apiUrl = "http://github.com/api/v2/json/repos/show/sideshowbarker/es5-spec",
    apiResponse,
    link,
    request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  function handleRequest() {
    if (request.readyState === 4 && request.status === 200) {
      apiResponse = JSON.parse(request.responseText);
      console.log(apiResponse.repository.pushed_at);
      link = document.createElement("a");
      link.setAttribute("href", "https://github.com/sideshowbarker/es5-spec");
      link.textContent = "Last updated: " +  apiResponse.repository.pushed_at.substring(0, 10);
      span.appendChild(link);
    }
  }
  request.open('GET', apiUrl, true);
  request.send(null);
  request.onreadystatechange = handleRequest;
}
window.addEventListener('load', addTimeStamp, false);
