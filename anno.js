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

function annotateHeadings(baseUrl, marker, className, annos) {
  var element, hyperlink, i, id, space, tocAnno, tocSpace, tocElement;
  for (id in annos) {
    if (id !== null) {
      element = document.getElementById(id);
      tocElement = document.getElementById(id + "-toc");
      for (i = 0; i < annos[id].length; i = i + 1) {
        space = document.createTextNode(" ");
        hyperlink = document.createElement("a");
        hyperlink.href = baseUrl + annos[id][i];
        hyperlink.className = className;
        hyperlink.target = "_blank";
        hyperlink.title = "Open " + hyperlink.href + " in new tab/window";
        hyperlink.textContent = marker;
        if (document.documentElement.className !== "split index" && element !== null) {
          element.appendChild(space);
          element.appendChild(hyperlink);
        }
        tocSpace = document.createTextNode(" ");
        tocAnno = document.createElement("b");
        tocAnno.className = className;
        tocAnno.textContent = marker;
        if (tocElement !== null) {
          tocElement.appendChild(tocSpace);
          tocElement.appendChild(tocAnno);
        }
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

// R markers
annotateHeadings(
  "https://developer.mozilla.org/en/JavaScript/Reference",
  "\u24c7",
  "mdcr",
  {
    "x7.4": [ "/Comments/comment" ],
    "x10.6": [ "/Functions_and_function_scope/arguments" ],
    "x11.1.1": [ "/Operators/Special/this" ],
    "x11.1.5": [ "/Operators/Special/get", "/Operators/Special/set" ],
    "x11.2.1": [ "/Operators/Member_Operators" ],
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
    "x11.6.1": [ "/Operators/String_Operators" ],
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
    "x12.1": [ "/Statements/block" ],
    "x12.2": [ "/Statements/var" ],
    "x12.5": [ "/Statements/if...else" ],
    "x12.6.1": [ "/Statements/do...while" ],
    "x12.6.2": [ "/Statements/while" ],
    "x12.6.3": [ "/Statements/for" ],
    "x12.6.4": [ "/Statements/for...in" ],
    "x12.7": [ "/Statements/continue" ],
    "x12.8": [ "/Statements/break" ],
    "x12.9": [ "/Statements/return" ],
    "x12.10": [ "/Statements/with" ],
    "x12.11": [ "/Statements/switch" ],
    "x12.12": [ "/Statements/label" ],
    "x12.13": [ "/Statements/throw" ],
    "x12.14": [ "/Statements/try...catch" ],
    "x12.15": [ "/Statements/debugger" ],
    "x13": [ "/Operators/Special/function" ],
    "x15": [ "#Standard_global_objects_(by_category)" ],
    "x15.1.1.1": [ "/Global_Objects/NaN" ],
    "x15.1.1.2": [ "/Global_Objects/Infinity" ],
    "x15.1.1.3": [ "/Global_Objects/undefined" ],
    "x15.1.2.1": [ "/Global_Objects/eval" ],
    "x15.1.2.2": [ "/Global_Objects/parseInt" ],
    "x15.1.2.3": [ "/Global_Objects/parseFloat" ],
    "x15.1.2.4": [ "/Global_Objects/isNaN" ],
    "x15.1.2.5": [ "/Global_Objects/isFinite" ],
    "x15.1.3.1": [ "/Global_Objects/decodeURI" ],
    "x15.1.3.2": [ "/Global_Objects/decodeURIComponent" ],
    "x15.1.3.3": [ "/Global_Objects/encodeURI" ],
    "x15.1.3.4": [ "/Global_Objects/encodeURIComponent" ],
    "x15.1.5.1": [ "/Global_Objects/Math" ],
    "x15.1.5.2": [ "/Global_Objects/JSON" ],
    "x15.2": [ "/Global_Objects/Object" ],
    "x15.2.3.1": [ "/Global_Objects/Object/prototype" ],
    "x15.2.3.2": [ "/Global_Objects/Object/GetPrototypeOf" ],
    "x15.2.3.3": [ "/Global_Objects/Object/getOwnPropertyDescriptor" ],
    "x15.2.3.4": [ "/Global_Objects/Object/getOwnPropertyNames" ],
    "x15.2.3.5": [ "/Global_Objects/Object/create" ],
    "x15.2.3.6": [ "/Global_Objects/Object/defineProperty" ],
    "x15.2.3.7": [ "/Global_Objects/Object/defineProperties" ],
    "x15.2.3.8": [ "/Global_Objects/Object/seal" ],
    "x15.2.3.9": [ "/Global_Objects/Object/freeze" ],
    "x15.2.3.10": [ "/Global_Objects/Object/preventExtensions" ],
    "x15.2.3.11": [ "/Global_Objects/Object/isSealed" ],
    "x15.2.3.12": [ "/Global_Objects/Object/isFrozen" ],
    "x15.2.3.13": [ "/Global_Objects/Object/isExtensible" ],
    "x15.2.3.14": [ "/Global_Objects/Object/keys" ],
    "x15.2.4.1": [ "/Global_Objects/Object/constructor" ],
    "x15.2.4.2": [ "/Global_Objects/Object/toString" ],
    "x15.2.4.3": [ "/Global_Objects/Object/toLocaleString" ],
    "x15.2.4.4": [ "/Global_Objects/Object/valueOf" ],
    "x15.2.4.5": [ "/Global_Objects/Object/hasOwnProperty" ],
    "x15.2.4.6": [ "/Global_Objects/Object/isPrototypeOf" ],
    "x15.2.4.7": [ "/Global_Objects/Object/propertyIsEnumerable" ],
    "x15.3": [ "/Global_Objects/Function" ],
    "x15.3.3.1": [ "/Global_Objects/Function/prototype" ],
    "x15.3.3.2": [ "/Global_Objects/Function/length" ],
    "x15.3.4.1": [ "/Global_Objects/Function/constructor" ],
    "x15.3.4.2": [ "/Global_Objects/Function/toString" ],
    "x15.3.4.3": [ "/Global_Objects/Function/apply" ],
    "x15.3.4.4": [ "/Global_Objects/Function/call" ],
    "x15.3.4.5": [ "/Global_Objects/Function/bind" ],
    "x15.3.5.1": [ "/Global_Objects/Function/length" ],
    "x15.3.5.2": [ "/Global_Objects/Function/prototype" ],
    "x15.4": [ "/Global_Objects/Array" ],
    "x15.4.3.1": [ "/Global_Objects/Array/prototype" ],
    "x15.4.3.2": [ "/Global_Objects/Array/isArray" ],
    "x15.4.4.1": [ "/Global_Objects/Array/constructor" ],
    "x15.4.4.2": [ "/Global_Objects/Array/toString" ],
    "x15.4.4.3": [ "/Global_Objects/Array/toLocaleString" ],
    "x15.4.4.4": [ "/Global_Objects/Array/concat" ],
    "x15.4.4.5": [ "/Global_Objects/Array/join" ],
    "x15.4.4.6": [ "/Global_Objects/Array/pop" ],
    "x15.4.4.7": [ "/Global_Objects/Array/push" ],
    "x15.4.4.8": [ "/Global_Objects/Array/reverse" ],
    "x15.4.4.9": [ "/Global_Objects/Array/shift" ],
    "x15.4.4.10": [ "/Global_Objects/Array/slice" ],
    "x15.4.4.11": [ "/Global_Objects/Array/sort" ],
    "x15.4.4.12": [ "/Global_Objects/Array/splice" ],
    "x15.4.4.13": [ "/Global_Objects/Array/unshift" ],
    "x15.4.4.14": [ "/Global_Objects/Array/indexOf" ],
    "x15.4.4.15": [ "/Global_Objects/Array/lastIndexOf" ],
    "x15.4.4.16": [ "/Global_Objects/Array/every" ],
    "x15.4.4.17": [ "/Global_Objects/Array/some" ],
    "x15.4.4.18": [ "/Global_Objects/Array/forEach" ],
    "x15.4.4.19": [ "/Global_Objects/Array/map" ],
    "x15.4.4.20": [ "/Global_Objects/Array/filter" ],
    "x15.4.4.21": [ "/Global_Objects/Array/reduce" ],
    "x15.4.4.22": [ "/Global_Objects/Array/reduceRight" ],
    "x15.4.5.2": [ "/Global_Objects/Array/length" ],
    "x15.5": [ "/Global_Objects/String" ],
    "x15.5.3.1": [ "/Global_Objects/String/prototype" ],
    "x15.5.3.2": [ "/Global_Objects/String/fromCharCode" ],
    "x15.5.4.1": [ "/Global_Objects/String/constructor" ],
    "x15.5.4.2": [ "/Global_Objects/String/toString" ],
    "x15.5.4.3": [ "/Global_Objects/String/valueOf" ],
    "x15.5.4.4": [ "/Global_Objects/String/charAt" ],
    "x15.5.4.5": [ "/Global_Objects/String/charCodeAt" ],
    "x15.5.4.6": [ "/Global_Objects/String/concat" ],
    "x15.5.4.7": [ "/Global_Objects/String/indexOf" ],
    "x15.5.4.8": [ "/Global_Objects/String/lastIndexOf" ],
    "x15.5.4.9": [ "/Global_Objects/String/localeCompare" ],
    "x15.5.4.10": [ "/Global_Objects/String/match" ],
    "x15.5.4.11": [ "/Global_Objects/String/replace" ],
    "x15.5.4.12": [ "/Global_Objects/String/search" ],
    "x15.5.4.13": [ "/Global_Objects/String/splice" ],
    "x15.5.4.14": [ "/Global_Objects/String/split" ],
    "x15.5.4.15": [ "/Global_Objects/String/substring" ],
    "x15.5.4.16": [ "/Global_Objects/String/toLowerCase" ],
    "x15.5.4.17": [ "/Global_Objects/String/toLocaleLowerCase" ],
    "x15.5.4.18": [ "/Global_Objects/String/toUpperCase" ],
    "x15.5.4.19": [ "/Global_Objects/String/toLocaleUpperCase" ],
    "x15.5.4.20": [ "/Global_Objects/String/trim" ],
    "x15.5.5.1": [ "/Global_Objects/String/length" ],
    "x15.6": [ "/Global_Objects/Boolean" ],
    "x15.6.3.1": [ "/Global_Objects/Boolean/prototype" ],
    "x15.6.4.1": [ "/Global_Objects/Boolean/constructor" ],
    "x15.6.4.2": [ "/Global_Objects/Boolean/toBoolean" ],
    "x15.6.4.3": [ "/Global_Objects/Boolean/valueOf" ],
    "x15.7": [ "/Global_Objects/Number" ],
    "x15.7.3.1": [ "/Global_Objects/Number/prototype" ],
    "x15.7.3.2": [ "/Global_Objects/Number/MAX_VALUE" ],
    "x15.7.3.3": [ "/Global_Objects/Number/MIN_VALUE" ],
    "x15.7.3.4": [ "/Global_Objects/Number/NaN" ],
    "x15.7.3.5": [ "/Global_Objects/Number/NEGATIVE_INFINITY" ],
    "x15.7.3.6": [ "/Global_Objects/Number/POSITIVE_INFINITY" ],
    "x15.7.4.1": [ "/Global_Objects/Number/constructor" ],
    "x15.7.4.2": [ "/Global_Numbers/Number/toString" ],
    "x15.7.4.3": [ "/Global_Numbers/Number/toLocaleString" ],
    "x15.7.4.4": [ "/Global_Numbers/Number/valueOf" ],
    "x15.7.4.5": [ "/Global_Numbers/Number/toFixed" ],
    "x15.7.4.6": [ "/Global_Numbers/Number/toExponential" ],
    "x15.7.4.7": [ "/Global_Numbers/Number/toPrecision" ],
    "x15.8": [ "/Global_Objects/Math" ],
    "x15.8.1.1": [ "/Global_Maths/Math/E" ],
    "x15.8.1.2": [ "/Global_Maths/Math/LN10" ],
    "x15.8.1.3": [ "/Global_Maths/Math/LN2" ],
    "x15.8.1.4": [ "/Global_Maths/Math/LOG2E" ],
    "x15.8.1.5": [ "/Global_Maths/Math/LOG10E" ],
    "x15.8.1.6": [ "/Global_Maths/Math/PI" ],
    "x15.8.2.1": [ "/Global_Maths/Math/abs" ],
    "x15.8.2.2": [ "/Global_Maths/Math/acos" ],
    "x15.8.2.3": [ "/Global_Maths/Math/asin" ],
    "x15.8.2.4": [ "/Global_Maths/Math/atan" ],
    "x15.8.2.5": [ "/Global_Maths/Math/atan2" ],
    "x15.8.2.6": [ "/Global_Maths/Math/ceil" ],
    "x15.8.2.7": [ "/Global_Maths/Math/cos" ],
    "x15.8.2.8": [ "/Global_Maths/Math/exp" ],
    "x15.8.2.9": [ "/Global_Maths/Math/floor" ],
    "x15.8.2.10": [ "/Global_Maths/Math/log" ],
    "x15.8.2.11": [ "/Global_Maths/Math/mox" ],
    "x15.8.2.12": [ "/Global_Maths/Math/min" ],
    "x15.8.2.13": [ "/Global_Maths/Math/pow" ],
    "x15.8.2.14": [ "/Global_Maths/Math/random" ],
    "x15.8.2.15": [ "/Global_Maths/Math/round" ],
    "x15.8.2.16": [ "/Global_Maths/Math/sin" ],
    "x15.8.2.17": [ "/Global_Maths/Math/sqrt" ],
    "x15.8.2.18": [ "/Global_Maths/Math/tan" ],
    "x15.9": [ "/Global_Objects/Date" ],
    "x15.9.4.1": [ "/Global_Objects/Date/prototype" ],
    "x15.9.4.2": [ "/Global_Objects/Date/parse" ],
    "x15.9.4.3": [ "/Global_Objects/Date/UTC" ],
    "x15.9.4.4": [ "/Global_Objects/Date/now" ],
    "x15.9.5.1": [ "/Global_Objects/Date/constructor" ],
    "x15.9.5.2": [ "/Global_Objects/Date/toString" ],
    "x15.9.5.3": [ "/Global_Objects/Date/toDateString" ],
    "x15.9.5.4": [ "/Global_Objects/Date/toTimeString" ],
    "x15.9.5.5": [ "/Global_Objects/Date/toLocaleString" ],
    "x15.9.5.6": [ "/Global_Objects/Date/toLocaleDateString" ],
    "x15.9.5.7": [ "/Global_Objects/Date/toLocaleTimeString" ],
    "x15.9.5.8": [ "/Global_Objects/Date/valueOf" ],
    "x15.9.5.9": [ "/Global_Objects/Date/getTime" ],
    "x15.9.5.10": [ "/Global_Objects/Date/getFullYear" ],
    "x15.9.5.11": [ "/Global_Objects/Date/getUTCFullYear" ],
    "x15.9.5.12": [ "/Global_Objects/Date/getMonth" ],
    "x15.9.5.13": [ "/Global_Objects/Date/getUTCMonth" ],
    "x15.9.5.14": [ "/Global_Objects/Date/getDate" ],
    "x15.9.5.15": [ "/Global_Objects/Date/getUTCDate" ],
    "x15.9.5.16": [ "/Global_Objects/Date/getDay" ],
    "x15.9.5.17": [ "/Global_Objects/Date/getUTCDay" ],
    "x15.9.5.18": [ "/Global_Objects/Date/getHours" ],
    "x15.9.5.19": [ "/Global_Objects/Date/getUTCHours" ],
    "x15.9.5.20": [ "/Global_Objects/Date/getMinutes" ],
    "x15.9.5.21": [ "/Global_Objects/Date/getUTCMinutes" ],
    "x15.9.5.22": [ "/Global_Objects/Date/getSeconds" ],
    "x15.9.5.23": [ "/Global_Objects/Date/getUTCSeconds" ],
    "x15.9.5.24": [ "/Global_Objects/Date/getMilliseconds" ],
    "x15.9.5.25": [ "/Global_Objects/Date/getUTCMilliseconds" ],
    "x15.9.5.26": [ "/Global_Objects/Date/getTimezoneOffset" ],
    "x15.9.5.27": [ "/Global_Objects/Date/setTime" ],
    "x15.9.5.28": [ "/Global_Objects/Date/setMilliseconds" ],
    "x15.9.5.29": [ "/Global_Objects/Date/setUTCMilliseconds" ],
    "x15.9.5.30": [ "/Global_Objects/Date/setSeconds" ],
    "x15.9.5.31": [ "/Global_Objects/Date/setUTCSeconds" ],
    "x15.9.5.32": [ "/Global_Objects/Date/setMinutes" ],
    "x15.9.5.33": [ "/Global_Objects/Date/setUTCMinutes" ],
    "x15.9.5.34": [ "/Global_Objects/Date/setHours" ],
    "x15.9.5.35": [ "/Global_Objects/Date/setUTCHours" ],
    "x15.9.5.36": [ "/Global_Objects/Date/setDate" ],
    "x15.9.5.37": [ "/Global_Objects/Date/setUTCDate" ],
    "x15.9.5.38": [ "/Global_Objects/Date/setMonth" ],
    "x15.9.5.39": [ "/Global_Objects/Date/setUTCMonth" ],
    "x15.9.5.40": [ "/Global_Objects/Date/setFullYear" ],
    "x15.9.5.41": [ "/Global_Objects/Date/setUTCFullYear" ],
    "x15.9.5.42": [ "/Global_Objects/Date/toUTCString" ],
    "x15.9.5.43": [ "/Global_Objects/Date/toISOString" ],
    "x15.9.5.44": [ "/Global_Objects/Date/toJSON" ],
    "x15.10": [ "/Global_Objects/RegExp" ],
    "x15.10.5.1": [ "/Global_Objects/RegExp/prototype" ],
    "x15.10.6.1": [ "/Global_Objects/RegExp/constructor" ],
    "x15.10.6.2": [ "/Global_Objects/RegExp/exec" ],
    "x15.10.6.3": [ "/Global_Objects/RegExp/test" ],
    "x15.10.6.4": [ "/Global_Objects/RegExp/toString" ],
    "x15.10.7.1": [ "/Global_Objects/RegExp/source" ],
    "x15.10.7.2": [ "/Global_Objects/RegExp/global" ],
    "x15.10.7.3": [ "/Global_Objects/RegExp/ignoreCase" ],
    "x15.10.7.4": [ "/Global_Objects/RegExp/multiline" ],
    "x15.10.7.5": [ "/Global_Objects/RegExp/lastIndex" ],
    "x15.11": [ "/Global_Objects/Error" ],
    "x15.11.3.1": [ "/Global_Objects/Error/prototype" ],
    "x15.11.4.1": [ "/Global_Objects/Error/constructor" ],
    "x15.11.4.2": [ "/Global_Objects/Error/name" ],
    "x15.11.4.3": [ "/Global_Objects/Error/message" ],
    "x15.11.4.4": [ "/Global_Objects/Error/toString" ],
    "x15.11.6.1": [ "/Global_Objects/Error/EvalError" ],
    "x15.11.6.2": [ "/Global_Objects/Error/RangeError" ],
    "x15.11.6.3": [ "/Global_Objects/Error/ReferenceError" ],
    "x15.11.6.4": [ "/Global_Objects/Error/SyntaxError" ],
    "x15.11.6.5": [ "/Global_Objects/Error/TypeError" ],
    "x15.11.6.6": [ "/Global_Objects/Error/URIError" ],
    "x15.11.7.6": [ "/Global_Objects/Error/prototype" ],
    "x15.11.7.8": [ "/Global_Objects/Error/constructor" ],
    "x15.11.7.9": [ "/Global_Objects/Error/name" ],
    "x15.11.7.10": [ "/Global_Objects/Error/message" ],
    "x15.12": [ "/Global_Objects/JSON" ],
    "x15.12.2": [ "/Global_Objects/JSON/parse" ],
    "x15.12.3": [ "/Global_Objects/JSON/stringify" ]
  }
);

// G markers
annotateHeadings(
  "https://developer.mozilla.org/en/JavaScript/Guide",
  "\u24bc",
  "mdcg",
  {
    "x4.2": [ "/Working_with_Objects" ],
    "x4.2.1": [ "/Details_of_the_Object_Model" ],
    "x6": [ "/Values%2c_Variables%2c_and_Literals#Unicode" ],
    "x7.4": [ "/Statements#Comments" ],
    "x7.8.2": [ "/Values%2c_Variables%2c_and_Literals#Boolean_Literals" ],
    "x7.8.3": [ "/Values%2c_Variables%2c_and_Literals#Integers", "Values%2c_Variables%2c_and_Literals#Floating-Point_Literals" ],
    "x7.8.4": [ "/Values%2c_Variables%2c_and_Literals#String_Literals" ],
    "x10.6": [ "Functions#Using_the_arguments_object" ],
    "x11": [ "/Expressions_and_Operators" ],
    "x11.1.1": [ "/Expressions_and_Operators#this" ],
    "x11.1.4": [ "/Values%2c_Variables%2c_and_Literals#Array_Literals" ],
    "x11.1.5": [ "/Working_with_Objects#Defining_Getters_and_Setters", "/Values%2c_Variables%2c_and_Literals#Object_Literals" ],
    "x11.2.2": [ "/Expressions_and_Operators#new" ],
    "x11.3.1": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.3.2": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.4.1": [ "/Expressions_and_Operators#delete" ],
    "x11.4.2": [ "/Expressions_and_Operators#void" ],
    "x11.4.3": [ "/Expressions_and_Operators#typeof" ],
    "x11.4.4": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.4.5": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.4.6": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.4.7": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.4.8": [ "/Expressions_and_Operators#Bitwise_Operators" ],
    "x11.4.9": [ "/Expressions_and_Operators#Logical_Operators" ],
    "x11.5": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.6": [ "/Expressions_and_Operators#Arithmetic_Operators" ],
    "x11.6.1": [ "/Expressions_and_Operators#String_Operators" ],
    "x11.7": [ "/Expressions_and_Operators#Bitwise_Shift_Operators" ],
    "x11.8": [ "/Expressions_and_Operators#Comparison_Operators" ],
    "x11.8.6": [ "/Expressions_and_Operators#instanceof" ],
    "x11.8.7": [ "/Expressions_and_Operators#in" ],
    "x11.9": [ "/Expressions_and_Operators#Comparison_Operators" ],
    "x11.10": [ "/Expressions_and_Operators#Bitwise_Operators" ],
    "x11.11": [ "/Expressions_and_Operators#Logical_Operators" ],
    "x11.12": [ "/Expressions_and_Operators#conditional_operator" ],
    "x11.13": [ "/Expressions_and_Operators#Assignment_Operators" ],
    "x11.14": [ "/Expressions_and_Operators#comma_operator" ],
    "x12": [ "/Statements" ],
    "x12.1": [ "/Statements#Block_Statement" ],
    "x12.2": [ "/Values%2c_Variables%2c_and_Literals#Variables" ],
    "x12.5": [ "/Statements#if...else_Statement" ],
    "x12.6.1": [ "/Statements#do...while_Statement" ],
    "x12.6.2": [ "/Statements#while_Statement" ],
    "x12.6.3": [ "/Statements#for_Statement" ],
    "x12.6.4": [ "/Statements#for...in_Statement" ],
    "x12.7": [ "/Statements#continue_Statement" ],
    "x12.8": [ "/Statements#break_Statement" ],
    "x12.10": [ "/Statements#with_Statement" ],
    "x12.11": [ "/Statements#switch_Statement" ],
    "x12.12": [ "/Statements#label_Statement" ],
    "x12.13": [ "/Statements#throw_Statement" ],
    "x12.14": [ "/Statements#try...catch_Statement" ],
    "x15.1.2.1": [ "/Functions#eval_Function" ],
    "x15.1.2.2": [ "/Functions#parseInt_and_parseFloat_Functions" ],
    "x15.1.2.3": [ "/Functions#parseInt_and_parseFloat_Functions" ],
    "x15.1.2.4": [ "/Functions#isNaN_Function" ],
    "x15.1.2.5": [ "/Functions#isFinite_Function" ],
    "x15.5.1": [ "/Functions#Number_and_String_Functions" ],
    "x15.7.1": [ "/Functions#Number_and_String_Functions" ],
    "x15.3": [ "/Functions", "/Predefined_Core_Objects#Function_Object" ],
    "x15.4": [ "/Predefined_Core_Objects#Array_Object" ],
    "x15.5": [ "/Predefined_Core_Objects#String_Object" ],
    "x15.6": [ "/Predefined_Core_Objects#Boolean_Object" ],
    "x15.7": [ "/Predefined_Core_Objects#Number_Object" ],
    "x15.8": [ "/Predefined_Core_Objects#Math_Object" ],
    "x15.9": [ "/Predefined_Core_Objects#Date_Object" ],
    "x15.10": [ "/Regular_Expressions", "/Predefined_Core_Objects#RegExp_Object" ],
    "B.2.1": [ "/Functions#escape_and_unescape_Functions" ],
    "B.2.2": [ "/Functions#escape_and_unescape_Functions" ]
  }
);

// D markers
annotateHeadings(
  "http://dmitrysoshnikov.com/ecmascript",
  "\u24b9",
  "dmas",
  {
    "x4.2":          [ "/javascript-the-core" ],
    "x4.3":          [ "/es5-chapter-1-properties-and-property-descriptors" ],
    "x8.6":          [ "/es5-chapter-1-properties-and-property-descriptors" ],
    "x8.10":         [ "/es5-chapter-1-properties-and-property-descriptors" ],
    "x8.12":         [ "/es5-chapter-1-properties-and-property-descriptors" ],
    "x15.2.3":       [ "/es5-chapter-1-properties-and-property-descriptors" ],
    "x4.2.2":        [ "/es5-chapter-2-strict-mode/" ],
    "x10.1.1":       [ "/es5-chapter-2-strict-mode/" ],
    "x14.1":         [ "/es5-chapter-2-strict-mode/" ],
    "x15.1.2.1.1":   [ "/es5-chapter-2-strict-mode/" ],
    "C":             [ "/es5-chapter-2-strict-mode/" ],
    "x10.2":         [ "/es5-chapter-3-1-lexical-environments-common-theory" ],
    "x13.2":         [ "/note-1-ecmascript-bound-functions" ],
    "x15.3.4.5":     [ "/note-1-ecmascript-bound-functions" ],
    "x11.4.3":       [ "/note-2-ecmascript-equality-operators/" ],
    "x11.9":         [ "/note-2-ecmascript-equality-operators/" ]
  }
);

// B markers
annotateHeadings(
  "https://bugs.ecmascript.org/show_bug.cgi?id=",
  "\u24b7",
  "bugs",
  {
    "x7.9.1":             [ "8" ],
    "x10.2.1.1.3":        [ "79" ],
    "x10.5":              [ "78" ],
    "x10.6":              [ "35", "115" ],
    "x12.6.1":            [ "8" ],
    "x13.1":              [ "174" ],
    "x15":                [ "121" ],
    "x15.12.3":           [ "81", "114" ],
    "x15.3.4":            [ "181" ],
    "x15.1.2.1.1":        [ "94" ],
    "x15.4.2.2":          [ "84" ],
    "x15.4.3.1":          [ "84" ],
    "x15.4.4.3":          [ "62" ],
    "x15.4.4.4":          [ "129", "131" ],
    "x15.4.4.6":          [ "162" ],
    "x15.4.4.7":          [ "131" ],
    "x15.5.2.1":          [ "84" ],
    "x15.5.4.11":         [ "97" ],
    "x15.9.1.15":         [ "112" ],
    "x15.11.6":           [ "9" ],
    "x15.11.7":           [ "9" ],
    "x15.12.2":           [ "82" ],
    "x7.2":               [ "123" ],
    "x7.3":               [ "123" ]
  }
);
