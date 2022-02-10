odoo.define('pos_internal_transfer.screen_internal_transfer_button', function (require) {
    "use strict"
    const PosComponent = require('point_of_sale.PosComponent')
    const ProductScreen = require('point_of_sale.ProductScreen')
    const Registries = require('point_of_sale.Registries')
    const { Gui } = require('point_of_sale.Gui')

    class PosInternalTransferButton extends PosComponent {
        async onClick() {
//            var self = this
//            console.log(this.env.pos.get_order().orderlines.models)
//            const warehouse_id = this.env.pos.picking_type.warehouse_id[0]
            const products_to_transfer = this.env.pos.get_order().orderlines.models

//            console.log(order.orderlines.models)
            if (products_to_transfer.length != 0) {
                Gui.showPopup('PopupInternalTransferWidget', {
                    products_to_transfer: products_to_transfer
//                    warehouse_id: warehouse_id
                })
            } else {
                Gui.showPopup('ErrorPopup', {
                    title: 'ERROR',
                    body: 'No ha seleccionado ni un producto a transferir'
                })
            }
        }
    }
    PosInternalTransferButton.template = 'PosInternalTransferButton';
    ProductScreen.addControlButton({
        component: PosInternalTransferButton,
        condition: function () {
            return true;
        },
    })

    Registries.Component.add(PosInternalTransferButton);
    return PosInternalTransferButton;
})