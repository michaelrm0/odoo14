odoo.define('pos_internal_transfer.receipt_internal_transfer', function(require){

    "use strict"
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');

//  Vista del recibo
    class ReceiptInternalTransfer extends PosComponent{
        constructor(){
            super(...arguments)
//            this._receiptEnv = this.props.receipt
//            console.log(this)
//            console.log(this.env.pos.get_order().getOrderReceiptEnv())
        }

        get receipt() {
            return this.env.pos.get_order().getOrderReceiptEnv().receipt
        }

        get values() {
//            console.log(this._receiptEnv)
          return this.props.receipt
        }
    }
    ReceiptInternalTransfer.template = 'ReceiptInternalTransfer'

    Registries.Component.add(ReceiptInternalTransfer)
    return ReceiptInternalTransfer
})