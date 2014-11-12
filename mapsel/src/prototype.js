/**
 * mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

mapsel.prototype = {
    hide: function() {
        if(this.element) {
            this.element.style.display = 'none';
        }
        
        this.visible = false;
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
