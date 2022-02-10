odoo.define('pos_internal_transfer.screen_print_component', function(require){
    "use strict";

    const { Printer } = require('point_of_sale.Printer');
    const { is_email } = require('web.utils');
    const { useRef, useContext } = owl.hooks;
    const { useErrorHandlers, onChangeOrder } = require('point_of_sale.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const AbstractReceiptScreen = require('point_of_sale.AbstractReceiptScreen');

//  Vista completa de la visualización de la impresión
    class PosPrintScreen extends AbstractReceiptScreen{
        constructor(){
            super(...arguments)
            useErrorHandlers()
            onChangeOrder(null, (newReceipt) => newReceipt && this.render())
            this.receiptInternalTransfer = useRef('receipt-internal-transfer')
            const order = this.currentOrder
            this.orderUiState = useContext(order.uiState.ReceiptScreen)
            this.orderUiState.inputEmail = this.orderUiState.inputEmail || ''
            this.is_email = is_email
            console.log("constructor")
            console.log(this)
            console.log(this.env.pos.get_order())
        }
        get currentOrder() {
            return this.env.pos.get_order();
        }

        get currentReceipt(){
            return this.props.data_receipt[0]
        }

        get nextScreen() {
            return { name: 'ProductScreen' };
        }

        orderDone() {
//            this.currentReceipt.finalize();
            const { name, props } = this.nextScreen;
            this.showScreen(name, props);
        }

//      Función asincrónica cada vez que se de en imprimir recibo
        async printReceipt() {
//          Despliega el documento con sus atributos de personalización
            const isPrinted = await this._printReceipt();
            if (isPrinted) {
//              Se le da un valor _printed = true para indicar que se ha imprimido el documento
                this.currentReceipt._printed = true;
            }
        }

        async onSendEmail() {
            if (!is_email(this.orderUiState.inputEmail)) {
                this.orderUiState.emailSuccessful = false;
                this.orderUiState.emailNotice = this.env._t('Invalid email.');
                return;
            }
            try {
                await this._sendReceiptToCustomer();
                this.orderUiState.emailSuccessful = true;
                this.orderUiState.emailNotice = this.env._t('Email sent.');
            } catch (error) {
                this.orderUiState.emailSuccessful = false;
                this.orderUiState.emailNotice = this.env._t('Sending email failed. Please try again.');
            }
        }

        async _sendReceiptToCustomer() {
            const printer = new Printer(null, this.env.pos)
            const receiptString = this.receiptInternalTransfer.comp.el.outerHTML
            const ticketImage = await printer.htmlToImg(receiptString)

            const receiptInternalTransferName = this.currentReceipt.display_name
            const email = this.orderUiState.inputEmail

//            const orderName = this.currentOrder.get_name()
//            const order_server_id = this.env.pos.validated_orders_name_server_id_map[orderName]

            console.log("impresion")
            console.log(this)
            console.log(this.env.pos.validated_orders_name_server_id_map[orderName])
            await this.rpc({
                model: 'pos.order',
                method: 'action_receipt_internal_transfer',
                args: [receiptInternalTransferName, email, ticketImage],
            }).then(function(res){
                console.log(res)
            }).catch(function(err){
                console.log(err)
            })
        }
    }
    PosPrintScreen.template = 'PosPrintScreen'

    Registries.Component.add(PosPrintScreen)
    return PosPrintScreen
})