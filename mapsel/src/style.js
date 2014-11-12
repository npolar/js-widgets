/**
 * mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

(function() {
    var head = document.head || document.getElementsByTagName('head')[0],
        styleElement = document.createElement('style'),
        styles = {
            '.mapsel': [
                'border-radius: 5px',
                'box-sizing: border-box',
                'font-family: sans-serif',
                'font-size: 0',
                'padding: 5px',
                'position: relative',
                'text-align: right'
            ],
            '.mapsel > a': [
                'color: #aaa',
                'display: inline-block',
                'font-size: inherit',
                'font-weight: bold',
                'margin: 0 2px 2px 2px',
                'text-decoration: none',
                'text-shadow: 0 0 2px #ccc'
            ],
            '.mapsel > a:hover': [
                'text-shadow: 0 0 1px #333'
            ],
            '.mapsel > div': [
                'border-radius: 5px',
                'display: block',
                'width: 100%'
            ],
            '.mapsel > label': [
                'box-sizing: border-box',
                'display: inline-block',
                'font-size: inherit',
                'padding-right: 5px',
                'text-align: right',
                'width: 40%'
            ],
            '.mapsel > input': [
                'box-sizing: border-box',
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
