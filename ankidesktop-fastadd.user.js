/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

// ==UserScript==
// @name            Send selection to anki
// @description     Extend contextual menu of firefox to allow user to send knowledge to Anki. For chrome, that will be replaced by an ugly buttom at the bottom right
// @version         3.0
// @author          Bruno
// @include         *
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @require     https://code.jquery.com/jquery-1.12.4.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @resource    https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css
// ==/UserScript==

/*
  This userscript (see tampermonkey and greasemonkey) takes advantage of the anki-connect plugin to allow
  the user to create flashcard within seconds by selecting the piece of information he wants to remember.


  References:
  - https://hacks.mozilla.org/2011/11/html5-context-menus-in-firefox-screencast-and-code/
  - http://thewebrocks.com/demos/context-menu/
  - http://userscripts-mirror.org/scripts/review/151097
  - https://foosoft.net/projects/anki-connect (required extension)
*/

//GM_addStyle("body { color: white; background-color: green; } img { border: 0; }");

var divform= document.body.appendChild(document.createElement("div"));
divform.innerHTML = '<form><fieldset>\
      <label for="question">Question</label>\
      <textarea rows="4" cols="50" name="question" id="ankiquestion" class="text ui-widget-content ui-corner-all"></textarea>\
      <label for="answer">Answer</label>\
      <textarea rows="4" cols="50" name="answer" id="ankianswer" class="text ui-widget-content ui-corner-all"></textarea>\
      <select id="deckdrop">\
      </select>\
    </fieldset>\
  </form>';

divform.setAttribute("id", "dialog-form");
divform.setAttribute("title", "Edit your fields and send it !");
divform.setAttribute("class", "ui-dialog");

GM_addStyle("label, input { display:block; }");
GM_addStyle("fieldset { padding:0; border:0; margin-top:25px; }");
GM_addStyle(".ui-dialog { padding: .3em; background-color: #3a8c8e33 !important;}");
GM_addStyle(".ui-dialog-titlebar-close {display: none;}");

    dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 440,
      width: 400,
      modal: true,
      buttons: {
        "Send to Anki": function() {
            var question = $("#ankiquestion").val();
            var answer = $("#ankianswer").val();
            sendToAnki(question, answer);
            dialog.dialog("close");
        },
        Cancel: function() {
          dialog.dialog("close");
        }
      },
      close: function() {
         $("#ankiquestion").val("");
         $("#ankiquestion").val("");
      }
    });

var menu = document.body.appendChild(document.createElement("menu"));
var html = document.documentElement;
if (html.hasAttribute("contextmenu")) {
  // We don't want to override web page context menu if any
  var contextmenu = $("#" + html.getAttribute("contextmenu"));
  contextmenu.appendChilkid(menu); // Append to web page context menu
} else {
  html.setAttribute("contextmenu", "userscript-anki-context-menu");
}

var deckList = ["Default"];

getListDecks();

var outerHtml = '<menu id="userscript-anki-context-menu" type="context">\
                    <menu label="Learn" url="#">\
                      <menuitem id="anki" label="Send selection to anki">\
                      </menuitem>\
                    </menu>\
                  </menu>';

menu.outerHTML = outerHtml;

// If browser supports contextmenu
if ("contextMenu" in html && "HTMLMenuItemElement" in window) {
  // Executed on clicking a menuitem
  document.getElementById("anki").addEventListener("click", forward, false);
  //html.addEventListener("contextmenu", initMenu, false); // Executed on right clicking
}else{
  // Else we write a damned button
  GM_addStyle(".AnkiButton { display: block; position: fixed !important; bottom: 0 !important; right: 0 !important; width: 64px; height: 32px; cursor: pointer; }");
  var btn = document.createElement('input');
  btn.setAttribute('id', "ankibutton");
  btn.setAttribute('value', 'Anki');
  btn.setAttribute('type', 'button');
  btn.setAttribute('class', 'AnkiButton');
  btn.setAttribute('title', 'you can drag me');
  btn.setAttribute('z-index', 99999999999);
  document.getElementsByTagName('body')[0].appendChild(btn);
  btn.addEventListener("click", forward, false);
  btn.addEventListener('mousedown', ankiButtonMousedown, false);
  window.addEventListener('mouseup', ankiButtonMouseup, false);
}

function forward(e) {
  var text = getSelectionText();
  $("#ankianswer").val(text);
  $("#dialog-form").dialog("open");
  $("#ankiquestion").focus();

    /*
  if((e.target.id==="ankibutton")||(e.target.id==="anki")){
    sendToAnki(text);
  }else{
    alert("a problem has occured");
  }*/
}

function ankiButtonMouseup(e){
    window.removeEventListener('mousemove', ankimousemove, true);
}

function ankiButtonMousedown(e){
    var div = document.getElementById('ankibutton');
    offY= e.clientY-parseInt(div.offsetTop);
    offX= e.clientX-parseInt(div.offsetLeft);
    window.addEventListener('mousemove', ankimousemove, true);
}

function ankimousemove(e){
  var div = document.getElementById('ankibutton');
  div.style.position = 'absolute';
  div.style.top = (e.clientY-offY) + 'px';
  div.style.left = (e.clientX-offX) + 'px';
}


//function $(aSelector, aNode) {
//  return (aNode || document).querySelector(aSelector);
//}

function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      (activeElTagName == "textarea") || (activeElTagName == "input" &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
      (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

function initDropDown(values){
    var select = document.getElementById("deckdrop");
    for (i = 0; i < values.length; i++) {
        opt = document.createElement("option");
        opt.value = values[i];
        opt.textContent = values[i];
        select.appendChild(opt);
    }
}

function getChosenDeck(){
  var e = document.getElementById("deckdrop");
  return e.options[e.selectedIndex].value;
}

function getListDecks(){
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://127.0.0.1:8765",
      data: JSON.stringify({"action":"deckNames"}),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      onload: function(response) {
          var deckList = JSON.parse(response.responseText);
          initDropDown(deckList);
        },
      onerror: function(response){
         //console.log(response);
         alert("A problem occured. Possible causes : Anki is not running or the extension anki-connect or your port 8765 is not available. Check in your webbrowser that this address do not 404 : http://127.0.0.1:8765/");
      },
    });
}

function sendToAnki(question, answer){
  var deckchosen = getChosenDeck();
  answer += "<br/><em>source : "+document.location.href+"</em>";
    var addNote = {
      "action": "addNotes",
      "version": 5,
      "params": {
          "notes": [
              {
                  "deckName": deckchosen,
                  "modelName": "Basic",
                  "fields": {
                      "Front": question,
                      "Back": answer,
                  },
                  "tags": [
                      "webbrowser"
                  ],
              }
          ]
      }
    };
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://127.0.0.1:8765",
      data: JSON.stringify(addNote),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      onload: function(response) {
          alert("Your question has been sent to anki");
        },
      onerror: function(response){
         alert("A problem occured. Possible causes : Anki is not running or the extension anki-connect or your port 8765 is not available. Check in your webbrowser that this address do not 404 : http://127.0.0.1:8765/");
      },
    });
}
