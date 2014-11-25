/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

Mapsel.prototype = {
    on: function(event, callback) {
        if(typeof callback == 'function') {
            this.events[event] = callback;
        } else if(this.events[event]) {
            delete this.events[event];
        }
    },
    
    hide: function() {
        if(this.elements.root) {
            this.elements.root.style.display = 'none';
        }
        
        this.visible = false;
    },
    
    focus: function(element) {
        if(this.elements) {
            switch(element) {
            case 'lat':
            case 'latitude':
                if(this.elements.latInput) {
                    this.elements.latInput.focus();
                }
                break;
                
            case 'lng':
            case 'longitude':
                if(this.elements.lngInput) {
                    this.elements.lngInput.focus();
                }
                break;
                
            case 'rad':
            case 'radius':
                if(this.elements.radInput) {
                    this.elements.radInput.focus();
                }
                break;
            }
        }
    },
    
    init: function(api) {
        var self = this;
        
        for(var a in Mapsel.api) {
            if(api.toLowerCase() == a.toLowerCase()) {
                this.api = new Mapsel.api[a](self);
                return true;
            }
        }
        
        console.error('Unsupported map API: ' + api);
        return false;
    },
    
    move: function(x, y, relative) {
        if(this.elements.root) {
            this.elements.root.style.left = (relative ? this.x += x : this.x = Math.max(x, 0)) + 'px';
            this.elements.root.style.top = (relative ? this.y += y : this.y = Math.max(y, 0)) + 'px';
        }
    },
    
    resize: function(width, height, relative) {
        this.width = Math.max((relative ? this.width += width : width), 200);
        this.height = Math.max((relative ? this.height += height : height), 200);
        
        // Obtain the pixel width of the longest printable label
        var labelWidth = 0, widthTestElem = document.createElement('span'), testStrings = [ 'LATITUDE', 'LONGITUDE', 'RADIUS' ];
        widthTestElem.style.fontSize = this.font.size;
        widthTestElem.style.visibility = 'hidden';
            
        document.body.appendChild(widthTestElem);
        for(var l in Mapsel.i18n[this.language]) {
            if(testStrings.indexOf(l) == -1) {
                continue;
            }
            
            widthTestElem.innerHTML = Mapsel.i18n[this.language][l];
            labelWidth = Math.max(labelWidth, widthTestElem.offsetWidth);
        }
        
        document.body.removeChild(widthTestElem);
        var labelWidthPercent = Math.ceil(((labelWidth + 15) / this.width) * 100),
            labelWidthString = labelWidthPercent + '%',
            inputWidthString = (100 - labelWidthPercent) + '%';
            
        // Calculate the map-container height
        var mapHeight = this.height, baseStyle = window.getComputedStyle(this.elements.root, null);
        mapHeight -= (parseInt(baseStyle.borderTopWidth) + parseInt(baseStyle.borderBottomWidth));
        mapHeight -= (parseInt(baseStyle.paddingTop) + parseInt(baseStyle.paddingBottom));
        mapHeight -= this.elements.titleBar.offsetHeight;
        mapHeight -= this.elements.fieldset.offsetHeight;
            
        this.elements.latLabel.style.width = labelWidthString;
        this.elements.latInput.style.width = inputWidthString;
        this.elements.lngLabel.style.width = labelWidthString;
        this.elements.lngInput.style.width = inputWidthString;
        
        if(this.radius !== null) {
            this.elements.radLabel.style.width = labelWidthString;
            this.elements.radInput.style.width = inputWidthString;
        }
        
        this.elements.root.style.width = this.width + 'px';
        this.elements.root.style.height = this.height + 'px';
        this.elements.mapContainer.style.height = mapHeight + 'px';
    },
    
    show: function() {
        if(this.elements.root) {
            this.elements.root.style.display = 'block';
            
            if(typeof this.api == 'object') {
                this.api.center(this.latitude, this.longitude);
            } else {
                this.init(this.api);
            }
        }
        
        this.visible = true;
    }
};
