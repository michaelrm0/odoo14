odoo.define("widget_marker_map.marker", function(require){
//  Todos los campos de edición que muestren datos son un AbstractField(button, calendar, etc)
    var AbstractField = require("web.AbstractField")
    var field_registry = require("web.field_registry")

    var FieldMarkerMap = AbstractField.extend({
        template: "widget_marker_map_template",
//        Está indicando que campos va a soportar según el tipo de dato, para este caso es para char
        supportedFieldTypes: ["char"],
        events: {
            "click .marker_map": "geolocate_me"
        },
//      El init es el constructor para inicializar variables
//      El start se ejecuta después del init y sirve para renderizar las vistas
        init: function(parent, name, record, options){
            this._super(parent, name, record, options)
            console.log(this.value)
            var location = this.value
            if(location){
//              Tratar de hacer esta validación con regex
                if(location.split("|").length == 2){
                    this.zoom = 15
                    this.lat = parseFloat(location.split("|")[0])
                    this.lng = parseFloat(location.split("|")[1])
                    return
                }
            }
            this.zoom = 15
            this.lat = -11.978485
            this.lng = -77.0009887
//            console.log(this.mode)
//            console.log(this.model)
//            console.log(this.res_id)
//            console.log(this.recordData)
        },
        geolocate_me: function(){
            var self = this
            console.log(navigator)
//          Primero valida si cuenta con los permisos de la geolocalización
            if("geolocation" in navigator){
                navigator.geolocation.getCurrentPosition(function(position){
                    self.lat = position.coords.latitude
                    self.lng = position.coords.longitude
                    self.zoom = 20
                    let location = String(self.lat) + "|" + String(self.lng)
                    self._setValue(location)
                })
            }
        },
//      Se ejecuta cuando se va a renderizar una vista con el tipo mode = readonly
        _renderReadonly: function(){
            var self = this
            var map = $(self.$el).find(".map")[0]
//          Se obtiene self.zoom porque primero se ejecuta el init y ya está registrado esa variable
//          Se está enviando parámetros para que se pueda visualizar el mapa
            self.map = new google.maps.Map(map, {
                zoom: self.zoom,
                center: {
//                  Nos estamos centrando en la posición según la latitud y longitud
                    lat: self.lat,
                    lng: self.lng
                }
            })
//            console.log(window.location.origin + "/addons/widget_marker_map/static/src/images/marker_auto.png")
            let image = "https://lh3.googleusercontent.com/fife/AAWUweVx9-1Po6gTgrleG3yYgqdWbZwGebRvO7RxunkrRiEQv5lBZzRVfx97cvXBXISKRwq_CAnyGakBBmJO6DquJUOjjjoTJreuahgc9U1C7Ktd18TcYrUA5hnlKnkVkbfdNrt7LYh9jwE6MVv_u1yfkhpRCjQ5vhJJou5OAEdlCKoIYw2yuE-W1vR6O1FjdIYsPSRTUKPhop3_OHWcKSZ9KXKthZl4lDYXlokrHaq3xN3qUnTrGbmJFk6ClAJFrzhLl86cwLd59YZiuRSvTwICGVuVIHf0Fond7h5FMzMMAeXcEm_VaFFHCIMe1-gLGO2HRDbACAfvEg4AgamagE9CsJfo-cGf6tRbfN0hj_GmhMcQyRIsTfwlYTGM_fVjfswOiM4UAGbJNM5zZ0MHcQq2gfXP-_JyVadqzIBalQ0pvTFBK_KBDc9yobRSVLHKUpW2DZew_ULfpgYZdphw4_LIohEFGFkl--x3VejlkIC3Kc_TcMKT-heQCjuHqGk8Jl_jRJfIYaGCKrwWSuMSI---1ndI9-l2uVEA5lznneOgnUzBnHva7nNsCShvM-vQPBAcUofTVFh4uBcDzJx0_qm9J_CVKV5JBiw_niABjRX1nttM37QC7giKncuc4aQZ2hrOOMPQPBKxcdBb8Fc4zXjk2JFXKGEWce41FQWWdZFPCaax7noqeZyZcFE_6LvOqnAn3STbp5r4xcj4enEiy5Pkt0R3y0k=w1920-h902-ft"
//          Es para mostrar el marcador en el mapa
            self.marker = new google.maps.Marker({
                map: self.map,
//                icon: image,
                position: {
                    lat: self.lat,
                    lng: self.lng
                }
            })
        },
//      Se ejecuta cuando se va a renderizar una vista con el tipo mode = edit
        _renderEdit: function(){
            var self = this
            var map = $(self.$el).find(".map")[0]
            this.map = new google.maps.Map(map, {
                zoom: self.zoom,
                center: {
                    lat: self.lat,
                    lng: self.lng
                }
            })

            let image = "https://lh3.googleusercontent.com/fife/AAWUweVx9-1Po6gTgrleG3yYgqdWbZwGebRvO7RxunkrRiEQv5lBZzRVfx97cvXBXISKRwq_CAnyGakBBmJO6DquJUOjjjoTJreuahgc9U1C7Ktd18TcYrUA5hnlKnkVkbfdNrt7LYh9jwE6MVv_u1yfkhpRCjQ5vhJJou5OAEdlCKoIYw2yuE-W1vR6O1FjdIYsPSRTUKPhop3_OHWcKSZ9KXKthZl4lDYXlokrHaq3xN3qUnTrGbmJFk6ClAJFrzhLl86cwLd59YZiuRSvTwICGVuVIHf0Fond7h5FMzMMAeXcEm_VaFFHCIMe1-gLGO2HRDbACAfvEg4AgamagE9CsJfo-cGf6tRbfN0hj_GmhMcQyRIsTfwlYTGM_fVjfswOiM4UAGbJNM5zZ0MHcQq2gfXP-_JyVadqzIBalQ0pvTFBK_KBDc9yobRSVLHKUpW2DZew_ULfpgYZdphw4_LIohEFGFkl--x3VejlkIC3Kc_TcMKT-heQCjuHqGk8Jl_jRJfIYaGCKrwWSuMSI---1ndI9-l2uVEA5lznneOgnUzBnHva7nNsCShvM-vQPBAcUofTVFh4uBcDzJx0_qm9J_CVKV5JBiw_niABjRX1nttM37QC7giKncuc4aQZ2hrOOMPQPBKxcdBb8Fc4zXjk2JFXKGEWce41FQWWdZFPCaax7noqeZyZcFE_6LvOqnAn3STbp5r4xcj4enEiy5Pkt0R3y0k=w1920-h902-ft"
            this.marker = new google.maps.Marker({
                map: self.map,
//                icon: image,
//              Este atributo permite arrastrar el marcador
                draggable: true,
//              Necesario para ver al marcador arrastrarse
                animation: google.maps.Animation.DROP,
                position: {
                    lat: self.lat,
                    lng: self.lng
                }
            })

//          Servirá para mover de posición al cursor donde se haga doble click
//          Evento cuando se da doble click al mapa
            self.map.addListener("dblclick", function(ev){
//              En el ev guarda información de la latitud, longitud y el zoom
                self.lat = ev.latLng.lat()
                self.lng = ev.latLng.lng()
//              Cambiamos de posición al cursor
                self.marker.setPosition({
                    lat: self.lat,
                    lng: self.lng
                })
//              Guardamos la nueva posición del cursor
                let location = String(self.lat) + "|" + String(self.lng)
//              Hasta acá el valor de la ubicación está listo para ser guardado en la BD
                self._setValue(location)
            })

//          Evento que salta cuando se mueve el cursor
            self.marker.addListener("dragend", function(ev){
                console.log(ev)
                let position = self.marker.getPosition()
                self.lat = position.lat()
                self.lng = position.lng()
                let location = String(self.lat) + "|" + String(self.lng)
                self._setValue(location)
            })

//          Evento para que cuando se de click al marcador se ejecute la animación BOUND
            self.marker.addListener("click", function(ev){
//              console.log(self.marker.getAnimation())
                if (self.marker.getAnimation() !== null){
                    console.log(self.marker.setAnimation(null))
                }else{
                    console.log(self.marker.setAnimation(google.maps.Animation.BOUNCE))
                }
            })
        }
    })

    field_registry.add("field_marker_map", FieldMarkerMap)
})