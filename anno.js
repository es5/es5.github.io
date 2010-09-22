// No copyright is asserted on this file.

function xhrAnnoShow(node, panelDiv, annoClicked) {
  var self = this;
  this.request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  this.loading = document.createElement("i");
  this.loading.textContent = "loading";
  panelDiv.appendChild(loading);
  this.request.onreadystatechange = function () {
    console.log(self.request.readyState);
    var networkStatus = document.createElement("span");
    panelDiv.appendChild(networkStatus);
    var dots = "..";
    for (var i = 0; i < parseInt(self.request.readyState); i++) {
      dots += ".";
    }
    while (networkStatus.firstChild) networkStatus.removeChild(networkStatus.firstChild);
    networkStatus.textContent = dots;
    if (self.request.readyState == 4) {
      // panelDiv.innerHTML = request.responseText;
      if (self.request.status == 200) {
        panelDiv.innerHTML = self.request.responseText;
      } else {
        var section = node.parentNode.id.substring(0,1) == "x" ? node.parentNode.id.substring(1) : node.parentNode.id;
        if (annoClicked) {
          panelDiv.innerHTML = "<p class='nope'>There aren't any annotations for section <i>"+section+"</i> yet…</p>"
          + "<p>If you’d like to contribute annotations, see the "
          + "<a href='http://sideshowbarker.github.com/es5-spec/README.html#contributing'>instructions on how to do so</a>.</p>";
        } else {
          panelDiv.innerHTML = "<p class='nope'>There are no errata for section <i>"+section+"</i>.</p>";
        }
      }
    }
  };
  if (annoClicked) {
    self.request.open('GET', 'anno/'+node.parentNode.id+'.html', true);
    self.request.send(null);
  } else {
    self.request.open('GET', 'erra/'+node.parentNode.id+'.html', true);
    self.request.send(null);
  }
}
var annoPanel;
var annotations = document.getElementById("annotations");
document.addEventListener('click', annoShow, false);
document.addEventListener("keyup", function(e) {
  if(!e) e=window.event;
  var key = e.keyCode ? e.keyCode : e.which;
  if ( key == 27 && annoPanel) {
    document.getElementById("bubble").setAttribute("style","display: none");
    annotations.removeChild(annoPanel);
    annoPanel = null;
  }
}, true);
function annoShow(event) {
  var annoClicked = false
  var erraClicked = false
  var node = event.target;
  if (node.className == "anno") {
    annoClicked = true;
  } else if (node.className == "erra") {
    erraClicked = true;
  } else if (node.className == "newWin") {
    var win = window.open();
    var styles = document.createElement("link");
    var winTitle = document.createElement("title");
    var annoHref = document.getElementById("anno-section-id").textContent;
    var annoType = document.getElementById("anno-type").textContent;
    var sectionNum = annoType == " Errata" ? annoHref.substring(annoHref.indexOf('#') + 1) : annoHref.substring(annoHref.indexOf('#') + 2);
    winTitle.textContent = "ES5 "+sectionNum+" "+annoType;
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute("href", "http://sideshowbarker.github.com/es5-spec/style.css");
    win.document.documentElement.firstChild.appendChild(styles);
    win.document.documentElement.firstChild.appendChild(winTitle);
    var annoBody = win.document.importNode(document.getElementById("annotation"),true);
    win.document.body.appendChild(annoBody);
    win.document.close();
    document.getElementById("bubble").setAttribute("style","display: none");
    annotations.removeChild(annoPanel);
    annoPanel = null;
    return;
  }
  if (annoPanel) {
    document.getElementById("bubble").setAttribute("style","display: none");
    annotations.removeChild(annoPanel);
    annoPanel = null;
  }
  var panel = document.createElement('div');
  panel.className = 'annoPanel';
  if (node && (annoClicked || erraClicked)) {
    var permalinkP = document.createElement('p');
    var permalinkA = document.createElement('a');
    var titleI = document.createElement('i');
    permalinkA.id = 'anno-section-id';
    permalinkA.href = '#' + node.parentNode.id;
    permalinkA.textContent = '#' + node.parentNode.id;
    permalinkP.appendChild(permalinkA);
    permalinkP.appendChild(titleI);
    titleI.setAttribute("id","anno-type");
    titleI.textContent = annoClicked ? " Annotations" : " Errata";
    panel.appendChild(permalinkP);
    var newWin = document.createElement('span');
    newWin.className = "newWin";
    newWin.setAttribute("title","Open in new window/tab");
    newWin.textContent = "⇧";
    var closeBox = document.createElement('span');
    closeBox.className = "closeBox";
    closeBox.textContent = "×";
    permalinkP.appendChild(closeBox);
    permalinkP.appendChild(newWin);
    panelDiv = document.createElement('div');
    panelDiv.setAttribute("id","annotation");
    if (node.parentNode.id) {
      xhrAnnoShow(node, panelDiv, annoClicked);
      panel.appendChild(panelDiv);
    } else {
      console.log(node);
      return -1;
    }
    annotations.appendChild(panel);
    document.getElementById("bubble").setAttribute("style","display: inline");
    annoPanel = panel;
  } else {
    // Do nothing: The user just clicked at some place in the page
    // that's not special.
  }
}
