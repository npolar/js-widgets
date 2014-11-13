/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

(function() {
    var head = document.head || document.getElementsByTagName('head')[0],
        styleElement = document.createElement('style'),
        styles = {
            '.mapsel': [
                'border: 1px solid #aaa',
                'border-radius: 5px',
                'box-shadow: 0 0 2px 0 #aaa',
                'box-sizing: border-box',
                'font-family: sans-serif',
                'font-size: 0',
                'padding: 5px',
                'text-align: right'
            ],
            '.mapsel *' : [
                'border: 0',
                'box-sizing: border-box',
                'font-weight: normal',
                'line-height: normal',
                'margin: 0',
                'padding: 0'
            ],
            '.mapsel header a': [
                'color: #aaa',
                'cursor: pointer',
                'display: inline-block',
                'font-size: inherit',
                'font-weight: bold',
                'margin: 0 2px 5px 0',
                'text-decoration: none',
                'text-shadow: 0 0 2px #ccc'
            ],
            '.mapsel header a:hover': [
                'text-shadow: 0 0 1px #333'
            ],
            '.mapsel > div': [
                'border: 1px solid #aaa',
                'border-radius: 5px',
                'display: block',
                'width: 100%'
            ],
            '.mapsel fieldset label': [
                'display: inline-block',
                'font-size: inherit',
                'padding-right: 5px',
                'text-align: right',
                'width: 40%'
            ],
            '.mapsel fieldset input': [
                'border: 1px solid #aaa',
                'border-radius: 5px',
                'box-shadow: 0 0 2px 0 #aaa inset',
                'font-size: inherit',
                'margin-top: 5px',
                'padding: 2px 5px',
                'width: 60%'
            ]
        };
        
    styleElement.type = 'text/css';
        
    for(var s in styles) {
        var node = s + ' {';
        
        for(var n in styles[s]) {
            node += styles[s][n] + ';';
        }
        
        styleElement.appendChild(document.createTextNode(node + '}'));
    }
    
    head.appendChild(styleElement);
})();
