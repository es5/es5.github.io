// No copyright is asserted on this file.

function xhrAnnoShow(node, panelDiv) {
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
      console.log(request);
        panelDiv.innerHTML = request.responseText;
        // panelDiv.innerHTML = "<p>There aren't any annotations for this section yet…</p>";
    }
  };
  try {
    request.open('GET', 'anno/'+node.parentNode.id+'.html', true);
    request.send(null);
  } catch (e) {
    console.log('anno/'+node.parentNode.id+'.html');
    console.log(e);
    return -1;
  }
}
var annoPanel;
var mascot = document.getElementById("mascot-talkbox");
document.addEventListener('click', annoShow, false);
document.addEventListener("keyup", function(e) {
  if(!e) e=window.event;
  var key = e.keyCode ? e.keyCode : e.which;
  if ( key == 27 && annoPanel) {
    mascot.removeChild(annoPanel);
    annoPanel = null;
  }
}, true);
function annoShow(event) {
  if (annoPanel) {
    mascot.removeChild(annoPanel);
    annoPanel = null;
  }
  var annoClicked = false
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
  if (node && annoClicked) {
    var permalinkP = document.createElement('p');
    var permalinkA = document.createElement('a');
    permalinkA.href = '#' + node.parentNode.id;
    permalinkA.textContent = '#' + node.parentNode.id;
    permalinkP.appendChild(permalinkA);
    panel.appendChild(permalinkP);
    panelDiv = document.createElement('div');
    if (node.parentNode.id) {
      xhrAnnoShow(node, panelDiv);
      panel.appendChild(panelDiv);
    } else {
      console.log(node);
      return -1;
    }
    mascot.appendChild(panel);
    annoPanel = panel;
  } else {
    // Do nothing: The user just clicked at some place in the page
    // that's not special.
  }
}
