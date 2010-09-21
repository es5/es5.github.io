// No copyright is asserted on this file.

function xhrAnnoShow(node, panelDiv, annoClicked) {
  var request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  var loading = document.createElement("i");
  loading.textContent = "loading";
  panelDiv.appendChild(loading);
  request.onreadystatechange = function () {
    var networkStatus = document.createElement("span");
    panelDiv.appendChild(networkStatus);
    var dots = "..";
    for (var i = 0; i < parseInt(request.readyState); i++) {
      dots += ".";
    }
    while (networkStatus.firstChild) networkStatus.removeChild(networkStatus.firstChild);
    networkStatus.textContent = dots;
    if (request.readyState == 4) {
      panelDiv.innerHTML = request.responseText;
      // if (request.status == 200) {
        // panelDiv.innerHTML = request.responseText;
      // } else {
        // var section = node.parentNode.id.substring(0,1) == "x" ? node.parentNode.id.substring(1) : node.parentNode.id;
        // if (annoClicked) {
          // panelDiv.innerHTML = "<p class='nope'>There aren't any annotations for section <i>"+section+"</i> yet…</p>"
          // + "<p>If you’d like to contribute annotations, see the "
          // + "<a href='http://sideshowbarker.github.com/es5-spec/README.html#contributing'>instructions on how to do so</a>.</p>";
        // } else {
          // panelDiv.innerHTML = "<p class='nope'>There are no errata for section <i>"+section+"</i>.</p>";
        // }
      // }
    }
  };
  try {
    if (annoClicked) {
      request.open('GET', 'anno/'+node.parentNode.id+'.html', true);
    } else {
      request.open('GET', 'erra/'+node.parentNode.id+'.html', true);
    }
    request.send(null);
  } catch (e) {
    console.log(e);
    return -1;
  }
}
var annoPanel;
var annotations = document.getElementById("annotations");
document.addEventListener('click', annoShow, false);
document.addEventListener("keyup", function(e) {
  if(!e) e=window.event;
  var key = e.keyCode ? e.keyCode : e.which;
  if ( key == 27 && annoPanel) {
    annotations.removeChild(annoPanel);
    annoPanel = null;
  }
}, true);
function annoShow(event) {
  if (annoPanel) {
    annotations.removeChild(annoPanel);
    annoPanel = null;
  }
  var annoClicked = false
  var erraClicked = false
  var node = event.target;
  if (node.className == "anno") {
    annoClicked = true;
  } else if (node.className == "erra") {
    erraClicked = true;
  }
  // while (node && node.parentNode && (node.nodeType != event.target.ELEMENT_NODE || node.tagName == "A" || !node.hasAttribute("id"))) {
    // if (node.parentNode.nodeType == node.parentNode.ELEMENT_NODE && node.parentNode.tagName == "DFN") {
      // annoClicked = true;
    // }
    // node = node.parentNode;
  // }
  var panel = document.createElement('div');
  panel.className = 'annoPanel';
  if (node && (annoClicked || erraClicked)) {
    var permalinkP = document.createElement('p');
    var permalinkA = document.createElement('a');
    var titleI = document.createElement('i');
    permalinkA.href = '#' + node.parentNode.id;
    permalinkA.textContent = '#' + node.parentNode.id;
    permalinkP.appendChild(permalinkA);
    permalinkP.appendChild(titleI);
    titleI.textContent = annoClicked ? " Annotations" : " Errata";
    panel.appendChild(permalinkP);
    var closeBox = document.createElement('span');
    closeBox.className = "closeBox";
    closeBox.textContent = "×";
    permalinkP.appendChild(closeBox);
    panelDiv = document.createElement('div');
    if (node.parentNode.id) {
      xhrAnnoShow(node, panelDiv, annoClicked);
      panel.appendChild(panelDiv);
    } else {
      console.log(node);
      return -1;
    }
    annotations.appendChild(panel);
    annoPanel = panel;
  } else {
    // Do nothing: The user just clicked at some place in the page
    // that's not special.
  }
}
