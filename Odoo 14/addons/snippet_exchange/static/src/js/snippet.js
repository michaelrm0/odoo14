odoo.define("snippet_exchange.snippet", function(require){
    var options = require("web_editor.snippets.options")
    var Dialog = require("web.Dialog")
    var core = require("web.core")
    var qweb = core.qweb

    options.registry.SnippetExchange = options.Class.extend({
        xmlDependencies: ["/snippet_exchange/static/src/xml/modal.xml"],
        start: function(){
            this._super()
        },
        edit: function(){
            var self = this
            var content_modal = qweb.render("modal_edit_snippet_exchange", {})

            self.modal = new Dialog(null, {
                title: "Edición de Exchange",
                $content: $(content_modal),
                buttons: [
                    {text: "Guardar", classes: "btn-primary", close: true, click: _.bind(self._saveChanges, self)},
                    {text: "Descartar", close: true}
                ]
            }).open()

//          opened es una función definida dentro de modal, que devuelve una promesa
            self.modal.opened().then(function(){
                var title = self.$target.find("h2").text()
                var text = self.$target.find("p").text()
                self.modal.$("input[name='title']").val(title)
                self.modal.$("textarea[name='text']").val(text)
            })
//            console.log(this)
//            console.log("edición")
//            this.$target.css({"background-color":"blue"})
        },
        _saveChanges: function(){
            var self = this
            var title = self.modal.$("input[name='title']").val()
            var text = self.modal.$("textarea[name='text']").val()
            self.$target.find("h2").text(title)
            self.$target.find("p").text(text)
        }
    })
})