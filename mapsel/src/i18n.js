/**
 * Mapsel.js - Map Coordinates Selector
 * Widget for selecting latitude and longitude from a map.
 *
 * Norsk Polarinstutt 2014, http://npolar.no/
 */

Mapsel.i18n = function(lang, code) {
    if(Mapsel.i18n[lang] && Mapsel.i18n[lang][code]) {
        return Mapsel.i18n[lang][code];
    } else if(Mapsel.i18n.alias[lang]) {
        for(var i in Mapsel.i18n.alias[lang]) {
            var alias = Mapsel.i18n.alias[lang][i];
            
            if(Mapsel.i18n[alias] && Mapsel.i18n[alias][code]) {
                return Mapsel.i18n[alias][code];
            }
        }
    }
    
    // Use English (en) as secondary fallback
    return Mapsel.i18n.en[code];
};

// Language aliases as primary fallback
Mapsel.i18n.alias = {
    no: [ 'nb', 'nn' ],
    nb: [ 'nn' ],
    nn: [ 'nb' ]
};

// Language definitions
Mapsel.i18n.en = {
    CLOSE:      'Click to close',
    LATITUDE:   'Latitude',
    LONGITUDE:  'Longitude',
    NORTHEAST:  'Northeast',
    RADIUS:     'Radius',
    SOUTHWEST:  'Southwest'
};

Mapsel.i18n.ja = {
    CLOSE:      '閉じます',
    LATITUDE:   '緯度',
    LONGITUDE:  '経度',
    NORTHEAST:  '北東',
    RADIUS:     '半径',
    SOUTHWEST:  '南西'
};

Mapsel.i18n.nb = {
    CLOSE:      'Klikk for å lukke',
    LATITUDE:   'Breddegrad',
    LONGITUDE:  'Lengdegrad',
    NORTHEAST:  'Nordøst',
    RADIUS:     'Radius',
    SOUTHWEST:  'Sydvest'
};

Mapsel.i18n.nn = {
    CLOSE:      'Klikk for å stengje',
    LATITUDE:   'Breiddegrad',
    LONGITUDE:  'Lengdegrad',
    NORTHEAST:  'Nordaust',
    RADIUS:     'Radius',
    SOUTHWEST:  'Sørvest'
};

Mapsel.i18n.yue = {
    CLOSE:      '點擊關閉',
    LATITUDE:   '緯度',
    LONGITUDE:  '經度',
    NORTHEAST:  '東北',
    RADIUS:     '半徑',
    SOUTHWEST:  '西南'
};

Mapsel.i18n.zh = {
    CLOSE:      '点击关闭',
    LATITUDE:   '纬度',
    LONGITUDE:  '经度',
    NORTHEAST:  '东北',
    RADIUS:     '半径',
    SOUTHWEST:  '西南'
};
