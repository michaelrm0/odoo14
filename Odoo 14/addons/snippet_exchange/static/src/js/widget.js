odoo.define("snippet_exchange.widget", function(require){
    var publicWidget = require("web.public.widget")

//  En este caso el nombre definido WidgetExchange no es relevante debido a que no se está jalando a un template
    publicWidget.registry.WidgetExchange = publicWidget.Widget.extend({
        selector: ".s_exchange",
//      Con esto desactivamos las opciones en modo edición
        disabledInEditableMode: false,
        events:{
            "change select[name='currency_from']": "change_currency_from",
            "change select[name='currency_to']": "change_currency_to",
            "change input[name='amount']": "change_amount"
        },
        start: function(){
            var self = this
            this._fetch().then(function(list){
                var content_currency_from = self.$el.find("select[name='currency_from']")
                var content_currency_to = self.$el.find("select[name='currency_to']")
                _.each(list.currencies,function(el, i){
                    content_currency_from.append("<option value='"+i+"'>"+el+"</option>")
                    content_currency_to.append("<option value='"+i+"'>"+el+"</option>")
                })
            })
        },
        _fetch: function(){
            var self = this

            return new Promise(function(resolve, reject){
                var settings = {
                    "url": "https://api.fastforex.io/currencies?api_key=a85a745428-871f3f5209-r6xdly",
                    "method": "GET"
                }
                $.ajax(settings).done(function (response){
                    resolve(response)
                })
            })
        },
        _fetch_value: function(currency_from, currency_to){
            var self = this

            return new Promise(function(resolve, reject){
                var settings = {
                    "url": `https://api.fastforex.io/fetch-one?from=${currency_from}&to=${currency_to}&api_key=a85a745428-871f3f5209-r6xdly`,
                    "method": "GET"
                }
                $.ajax(settings).done(function (response){
                    resolve(response)
                })
            })
        },
        change_currency_from: function(ev){
            var currency_current_from = $(ev.currentTarget).val()
            var currency_current_to = this.$el.find("select[name='currency_to']").val()
            var amount = this.$el.find("input[name='amount']").val()
            this.compute(currency_current_from, currency_current_to,amount)
        },
        change_currency_to: function(ev){
            var currency_current_from = this.$el.find("select[name='currency_from']").val()
            var currency_current_to = $(ev.currentTarget).val()
            var amount = this.$el.find("input[name='amount']").val()
            this.compute(currency_current_from, currency_current_to,amount)
        },
        change_amount:function(ev){
            var amount = $(ev.currentTarget).val()
            var currency_current_from = this.$el.find("select[name='currency_from']").val()
            var currency_current_to = this.$el.find("select[name='currency_to']").val()
            this.compute(currency_current_from, currency_current_to, amount)
        },
        compute:function(currency_current_from,currency_current_to, amount){
            var self = this

            this._fetch_value(currency_current_from, currency_current_to).then(function(values){
                self.$el.find("#result").text(values.result[currency_current_to]*amount)
            })
        }
    })
})