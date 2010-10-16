// No copyright is asserted on this file.
var annoPanel;
var annotations = document.getElementById("annotations");
function xhrAnnoShow(node, panelDiv, annoClicked) {
  var request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"),
       loading = document.createElement("i");
  function handleRequest() {
    var
      dots = "..",
      networkStatus = document.createElement("span"),
      section = "",
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
      } else {
        section = node.parentNode.id.substring(0, 1) === "x" ? node.parentNode.id.substring(1) : node.parentNode.id;
        if (annoClicked) {
          panelDiv.innerHTML = "<p class='nope'>There aren't any annotations for section <i>" + section + "</i> yet...</p>" +
          "<p>If you\u2019d like to contribute annotations, see the " +
          "<a href='http://sideshowbarker.github.com/es5-spec/README.html#contributing'>instructions on how to do so</a>.</p>";
        } else {
          panelDiv.innerHTML = "<p class='nope'>There are no errata for section <i>" + section + "</i>.</p>";
        }
      }
    }
  }
  loading.textContent = "loading...";
  panelDiv.appendChild(loading);
  if (annoClicked) {
    request.open('GET', 'anno/' + node.parentNode.id + '.html', true);
  } else {
    request.open('GET', 'erra/' + node.parentNode.id + '.html', true);
  }
  request.send(null);
  request.onreadystatechange = handleRequest;
}
function annoShow(event) {
  var
    annoBody,
    annoClicked = false,
    annoHref,
    annoType,
    closeBox,
    erraClicked = false,
    newWin,
    node = event.target,
    panel,
    panelDiv,
    permalinkA,
    permalinkP,
    sectionNum,
    styles,
    titleI,
    win,
    winTitle;
  if (node.className === "anno") {
    annoClicked = true;
  } else if (node.className === "erra") {
    erraClicked = true;
  } else if (node.className === "newWin") {
    styles = document.createElement("link");
    winTitle = document.createElement("title");
    annoHref = document.getElementById("anno-section-id").textContent;
    annoType = document.getElementById("anno-type").textContent;
    sectionNum = annoType === " Errata" ? annoHref.substring(annoHref.indexOf('#') + 1) : annoHref.substring(annoHref.indexOf('#') + 2);
    winTitle.textContent = "ES5 " + sectionNum + " " + annoType;
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute("href", "http://sideshowbarker.github.com/es5-spec/style.css");
    win = window.open(annoType.toLowerCase().substring(1, 5) + "/" + sectionNum + ".html");
    console.log(annoType.toLowerCase().substring(1, 5) + "/" + sectionNum + ".html");
    win.document.open("text/html");
    win.document.write("<!doctype html>");
    win.document.close();
    win.document.documentElement.firstChild.appendChild(styles);
    win.document.documentElement.firstChild.appendChild(winTitle);
    annoBody = win.document.importNode(document.getElementById("annotation"), true);
    win.document.body.appendChild(annoBody);
    document.getElementById("bubble").setAttribute("style", "display: none");
    annotations.removeChild(annoPanel);
    annoPanel = null;
    return 0;
  }
  if (annoPanel) {
    document.getElementById("bubble").setAttribute("style", "display: none");
    annotations.removeChild(annoPanel);
    annoPanel = null;
  }
  panel = document.createElement('div');
  panel.className = 'annoPanel';
  if (node && (annoClicked || erraClicked)) {
    permalinkP = document.createElement('p');
    permalinkA = document.createElement('a');
    titleI = document.createElement('i');
    permalinkA.id = 'anno-section-id';
    permalinkA.href = '#' + node.parentNode.id;
    permalinkA.textContent = '#' + node.parentNode.id;
    permalinkP.appendChild(permalinkA);
    permalinkP.appendChild(titleI);
    titleI.setAttribute("id", "anno-type");
    titleI.textContent = annoClicked ? " Annotations" : " Errata";
    panel.appendChild(permalinkP);
    newWin = document.createElement('span');
    newWin.className = "newWin";
    newWin.setAttribute("title", "Open in new window/tab");
    newWin.textContent = "\u21e7";
    closeBox = document.createElement('span');
    closeBox.className = "closeBox";
    closeBox.textContent = "\u00d7";
    permalinkP.appendChild(closeBox);
    permalinkP.appendChild(newWin);
    panelDiv = document.createElement('div');
    panelDiv.setAttribute("id", "annotation");
    if (node.parentNode.id) {
      xhrAnnoShow(node, panelDiv, annoClicked);
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
