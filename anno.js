// No copyright is asserted on this file.
var annoPanel;
var annotations = document.getElementById("annotations");
function xhrAnnoShow(node, panelDiv, annoType) {
  var
    request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"),
    loading = document.createElement("i");
  function handleRequest() {
    var
      annoHref,
      annoUrl,
      dots = "..",
      networkStatus = document.createElement("span"),
      newWin,
      permalinkP = document.getElementById("permalinkP"),
      section = "",
      sectionNum,
      state;
    panelDiv.appendChild(networkStatus);
    for (state = 0; state < parseInt(request.readyState, 10); state += 1) {
      dots += ".";
    }
    while (networkStatus.firstChild) {
      networkStatus.removeChild(networkStatus.firstChild);
    }
    networkStatus.textContent = dots;
    if (request.readyState === 4) {
      if (request.status === 200) {
        panelDiv.innerHTML = request.responseText;
        annoHref = document.getElementById("anno-section-id").textContent;
        sectionNum = annoHref.substring(annoHref.indexOf('#') + 1);
        annoUrl = node.className + "/" + sectionNum + ".html";
        newWin = document.createElement('a');
        newWin.id = "newWin";
        newWin.setAttribute("href", annoUrl);
        newWin.setAttribute("title", "Open in new window/tab");
        newWin.setAttribute("target", "_blank");
        newWin.textContent = "\u21e7";
        permalinkP.appendChild(newWin);
      } else {
        section = node.parentNode.id.substring(0, 1) === "x" ? node.parentNode.id.substring(1) : node.parentNode.id;
        if (annoType === "anno") {
          panelDiv.innerHTML = "<p class='nope'>There aren't any annotations for section <i>" + section + "</i> yet...</p>" +
          "<p>If you\u2019d like to contribute annotations, see the " +
          "<a href='http://sideshowbarker.github.com/es5-spec/README.html#contributing'>instructions on how to do so</a>.</p>";
        } else if (annoType === "rev1") {
          panelDiv.innerHTML = "<p class='nope'>There are no changes in revision 1 for section <i>" + section + "</i>.</p>";
        } else {
          panelDiv.innerHTML = "<p class='nope'>There are no errata for section <i>" + section + "</i>.</p>";
        }
      }
    }
  }
  loading.textContent = "loading...";
  panelDiv.appendChild(loading);
  if (annoType === "anno") {
    request.open('GET', 'anno/' + node.parentNode.id + '.html', true);
  } else if (annoType === "rev1") {
    request.open('GET', 'rev1/' + node.parentNode.id + '.html', true);
  } else {
    request.open('GET', 'erra/' + node.parentNode.id + '.html', true);
  }
  request.send(null);
  request.onreadystatechange = handleRequest;
}
function annoShow(event) {
  var
    closeBox,
    node = event.target,
    panel,
    panelDiv,
    permalinkA,
    permalinkP,
    titleI;
  if (annoPanel) {
    document.getElementById("bubble").setAttribute("style", "display: none");
    annotations.removeChild(annoPanel);
    annoPanel = null;
  }
  panel = document.createElement('div');
  panel.className = 'annoPanel';
  if (node && (node.className === "anno" || node.className === "rev1" || node.className === "erra")) {
    permalinkP = document.createElement('p');
    permalinkP.id = "permalinkP";
    permalinkA = document.createElement('a');
    titleI = document.createElement('i');
    permalinkA.id = 'anno-section-id';
    permalinkA.href = '#' + node.parentNode.id;
    permalinkA.textContent = '#' + node.parentNode.id;
    permalinkP.appendChild(permalinkA);
    permalinkP.appendChild(titleI);
    titleI.setAttribute("id", "anno-type");
    if (node.className === "anno") {
      titleI.textContent = " Annotations";
    } else if (node.className === "rev1") {
      titleI.textContent = " Changes in 5.1";
    } else if (node.className === "erra") {
      titleI.textContent = " Errata";
    } 
    panel.appendChild(permalinkP);
    closeBox = document.createElement('span');
    closeBox.id = "closeBox";
    closeBox.textContent = "\u00d7";
    permalinkP.appendChild(closeBox);
    panelDiv = document.createElement('div');
    panelDiv.setAttribute("id", "annotation");
    if (node.parentNode.id) {
      xhrAnnoShow(node, panelDiv, node.className);
      panel.appendChild(panelDiv);
    } else {
      return -1;
    }
    annotations.appendChild(panel);
    document.getElementById("bubble").setAttribute("style", "display: inline");
    annoPanel = panel;
  } else {
    // Do nothing: The user just clicked at some place in the page
    // that's not special.
    return 0;
  }
  return 0;
}
function annotateToc() {
  var
  i,
  anno = document.getElementsByClassName("anno"),
  erra = document.getElementsByClassName("erra"),
  rev1 = document.getElementsByClassName("rev1"),
  A,
  E,
  R;
  for (i = 0; i < erra.length; i = i + 1) {
    if (erra[i].offsetHeight !== 0) {
      E = document.createElement("span");
      E.setAttribute("class", "toc-anno");
      E.textContent = "\u24ba";
      document.getElementById(erra[i].parentNode.id + "-toc").parentNode.firstChild.appendChild(E);
    }
  }
  for (i = 0; i < rev1.length; i = i + 1) {
    if (rev1[i].offsetHeight !== 0) {
      R = document.createElement("span");
      R.setAttribute("class", "toc-anno");
      R.textContent = "\u2460";
      document.getElementById(rev1[i].parentNode.id + "-toc").parentNode.firstChild.appendChild(R);
    }
  }
  for (i = 0; i < anno.length; i = i + 1) {
    if (anno[i].offsetHeight !== 0) {
      A = document.createElement("span");
      A.setAttribute("class", "toc-anno");
      A.textContent = "\u24b6";
      document.getElementById(anno[i].parentNode.id + "-toc").parentNode.firstChild.appendChild(A);
    }
  }
}
document.addEventListener('click', annoShow, false);
// enable annotation pop-up to be dismissed by hitting esc key
document.addEventListener("keyup", function (e) {
  var key = 0;
  if (!e) {
    e = window.event;
  }
  key = e.keyCode ? e.keyCode : e.which;
  if (key === 27 && annoPanel) {
    document.getElementById("bubble").setAttribute("style", "display: none");
    annotations.removeChild(annoPanel);
    annoPanel = null;
  }
}, true);
annotateToc();
