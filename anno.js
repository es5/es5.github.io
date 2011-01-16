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
  var i,
  addMarker = function (annoType, symbol) {
    var E,
      nodeList = document.getElementsByClassName(annoType);
    for (i = 0; i < nodeList.length; i = i + 1) {
      if (nodeList[i].offsetHeight !== 0) {
        E = document.createElement("span");
        E.setAttribute("class", "toc-anno");
        E.textContent = symbol;
        // E.textContent = "\u24ba";
        document.getElementById(nodeList[i].parentNode.id + "-toc").parentNode.firstChild.appendChild(E);
      }
    }
  };
  addMarker("erra", "\u24ba");
  addMarker("rev1", "\u2460");
  addMarker("anno", "\u24b6");
  addMarker("mdcr", "\u24c2");
}
function addMdcRefAnnos() {
  var baseUrl = "https://developer.mozilla.org/en/JavaScript/Reference",
  element,
  hyperlink,
  i,
  id,
  space,
  mdcRefAnnos = {
    "x7.4": [ "/Comments/comment" ],
    "x10.6": [ "/Functions_and_function_scope/arguments" ],
    "x11.1.1": [ "/Operators/Special/this" ],
    "x11.1.5": [ "/Operators/Special/get", "/Operators/Special/set" ],
    "x11.2.2": [ "/Operators/Special/new" ],
    "x11.3.1": [ "/Operators/Arithmetic_Operators" ],
    "x11.3.2": [ "/Operators/Arithmetic_Operators" ],
    "x11.4.1": [ "/Operators/Special/delete" ],
    "x11.4.2": [ "/Operators/Special/void" ],
    "x11.4.3": [ "/Operators/Special/typeof" ],
    "x11.4.4": [ "/Operators/Arithmetic_Operators" ],
    "x11.4.5": [ "/Operators/Arithmetic_Operators" ],
    "x11.4.6": [ "/Operators/Arithmetic_Operators" ],
    "x11.4.7": [ "/Operators/Arithmetic_Operators" ],
    "x11.4.8": [ "/Operators/Bitwise_Operators" ],
    "x11.4.9": [ "/Operators/Logical_Operators" ],
    "x11.5": [ "/Operators/Arithmetic_Operators" ],
    "x11.6": [ "/Operators/Arithmetic_Operators" ],
    "x11.7": [ "/Operators/Bitwise_Operators#section_8" ],
    "x11.8": [ "/Operators/Comparison_Operators" ],
    "x11.8.6": [ "/Operators/Special/instanceof" ],
    "x11.8.7": [ "/Operators/Special/in" ],
    "x11.9": [ "/Operators/Comparison_Operators" ],
    "x11.10": [ "/Operators/Bitwise_Operators" ],
    "x11.11": [ "/Operators/Logical_Operators" ],
    "x11.12": [ "/Operators/Special/Conditional_Operator" ],
    "x11.13": [ "/Operators/Assignment_Operators" ],
    "x11.14": [ "/Operators/Special/Comma_Operator" ],
    "x15": [ "#Standard_global_objects_(by_category)" ],
    "x15.1.1.1": [ "/Global_Objects/NaN" ],
    "x15.1.1.2": [ "/Global_Objects/Infinity" ],
    "x15.1.1.3": [ "/Global_Objects/undefined" ],
    "x15.1.2.1": [ "/Global_Objects/eval" ],
    "x15.1.2.2": [ "/Global_Objects/parseFloat" ],
    "x15.1.2.3": [ "/Global_Objects/parseInt" ],
    "x15.1.2.4": [ "/Global_Objects/isNaN" ],
    "x15.1.2.5": [ "/Global_Objects/isFinite" ],
    "x15.1.3.1": [ "/Global_Objects/decodeURI" ],
    "x15.1.3.2": [ "/Global_Objects/decodeURIComponent" ],
    "x15.1.3.3": [ "/Global_Objects/encodeURI" ],
    "x15.1.3.4": [ "/Global_Objects/encodeURIComponent" ],
    "x15.1.5.1": [ "/Global_Objects/Math" ],
    "x15.1.5.2": [ "/Global_Objects/JSON" ],
    "x15.2": [ "/Global_Objects/Object" ],
    "x15.3": [ "/Global_Objects/Function" ],
    "x15.4": [ "/Global_Objects/Function" ],
    "x15.5": [ "/Global_Objects/String" ],
    "x15.6": [ "/Global_Objects/Boolean" ],
    "x15.7": [ "/Global_Objects/Number" ],
    "x15.8": [ "/Global_Objects/Math" ],
    "x15.9": [ "/Global_Objects/Date" ],
    "x15.10": [ "/Global_Objects/RegExp" ],
    "x15.11": [ "/Global_Objects/Error" ],
    "x15.12": [ "/Global_Objects/JSON" ],
  };
  for (id in mdcRefAnnos) {
    if (id !== null && id !== undefined) {
      element = document.getElementById(id);
      space = document.createTextNode(" ");
      for (i = 0; i < mdcRefAnnos[id].length; i = i + 1) {
        hyperlink = document.createElement("a");
        hyperlink.href = baseUrl + mdcRefAnnos[id][i];
        hyperlink.className = "mdcr";
        hyperlink.target = "_blank";
        hyperlink.title = "Open " + hyperlink.href + " in new tab/window";
        hyperlink.textContent = "\u24c2";
        element.appendChild(space);
        element.appendChild(hyperlink);
      }
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
addMdcRefAnnos();
annotateToc();
