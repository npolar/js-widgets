/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

Mapsel.prototype = {
    hide: function() {
        if(this.element) {
            this.element.style.display = 'none';
        }
        
        this.visible = false;
    },
    
    move: function(x, y, relative) {
        if(this.element) {
            this.element.style.left = (relative ? this.x += x : this.x = Math.max(x, 0)) + 'px';
            this.element.style.top = (relative ? this.y += y : this.y = Math.max(y, 0)) + 'px';
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
            
        this.elements.latLabel.style.width = labelWidthString;
        this.elements.latInput.style.width = inputWidthString;
        this.elements.lngLabel.style.width = labelWidthString;
        this.elements.lngInput.style.width = inputWidthString;
        
        if(this.radius !== null) {
            this.elements.radLabel.style.width = labelWidthString;
            this.elements.radInput.style.width = inputWidthString;
        }
        
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.elements.mapContainer.style.height = (this.height - ((this.closeable ? 30 : 10) + (30 * (this.radius ? 3 : 2)))) + 'px';
    },
    
    show: function() {
        if(this.element) {
            this.element.style.display = 'block';
            
            if(this.map.api) {
                this.map.api.setCenter({ lat: this.latitude, lng: this.longitude });
            }
        }
        
        this.visible = true;
    }
};
