odoo.define('pos_internal_transfer.screen_confirm_popup', function(require){
    "use strict";

    const rpc = require('web.rpc')
    const Registries = require('point_of_sale.Registries')
    const { useListener } = require('web.custom_hooks')
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup')
    const { Gui } = require('point_of_sale.Gui')

    const PosComponent = require('point_of_sale.PosComponent')

    class ConfirmInternalTransferWidget extends AbstractAwaitablePopup{
        constructor(){
            super(...arguments)
            this._receipt = null
        }

        mounted(){
            this.render_confirm()
        }

        render_confirm(){
            var self = this
            $("#table-body-confirm").empty()
            var transfer_id = this.props.transfer_id
//            console.log(this)
            rpc.query({
                model: "pos.config",
                method: "get_transfer_data",
                args: [transfer_id]
            }).then(function(data){
//                console.log(data)
                self._receipt = data
                var name_transfer = data[0].name
                var rows = `<tr><td>Transferencia Interna Creada: <span style='color: green;'>${name_transfer}</span></td></tr>`
                $(rows).appendTo("#list_confirm tbody")
            })
        }


        click_print(){
            this.trigger('close-popup')
            this.showScreen('PosPrintScreen', {
                data_receipt: this._receipt
            });
        }
    }

    ConfirmInternalTransferWidget.template = 'ConfirmInternalTransferWidget'

    Registries.Component.add(ConfirmInternalTransferWidget)

    return ConfirmInternalTransferWidget
})