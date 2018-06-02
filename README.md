# Anki-monkey
Userscript taking advantage of the anki-connect plugin to add cards into your anki desktop from the webbrowser. Before you continue reading, you use Chrome, you will find a much better alternative there: https://github.com/1nsp1r3rnzt/chrome-anki-quick-adder (not mine).

# Introduction   
This [userscript](https://github.com/OpenUserJs/OpenUserJS.org/wiki/Userscript-beginners-HOWTO) takes advantage of the anki-connect plugin to allow
the user to create flashcard within seconds by selecting the piece of information he wants to remember.
I only tested it with Chrome (TamperMonkey extension) and Firefox (GreaseMonkey extension). 

# Installation   
- Install the anki-connect plugin (https://ankiweb.net/shared/info/2055492159).   
- Install the greasemonkey extension if you are using firefox, tampermonkey if you are using chrome. 
- Install the user script present on this repository 
- If you are in trouble during the installation, see this [link](https://github.com/OpenUserJs/OpenUserJS.org/wiki/Userscript-beginners-HOWTO), explaining what a userscript is and how to install it.

# Usage
- Start (or restart) anki to let anki-connect launch itself. If it worked the page http://localhost:8765/ should be accessible.
- On your webbrowser, select the text you want to remember.
- Now, depending on your webbrowser :  
   - On firefox, right click on your selection, learn > send selection to anki
   - On Chrome, click on the draggable button in the bottom right corner of your screen.
- A window appears, letting the user decide the question for this text (and possibly change the answer too)

# Known Bugs, Todos, Remarks
- I could not extend to contextual menu in chrome, and the result is disapointing. A better trick anyone ?
- Adding tags could be implemented, that would be nice.
- An effort could be made with styles, right ?
- Only text is captured. Capturing HTML could be nice. Capturing images could also be nice. 
