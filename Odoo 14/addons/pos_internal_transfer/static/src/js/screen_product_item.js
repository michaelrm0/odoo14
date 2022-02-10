odoo.define("pos_internal_transfer.screen_product_item", function(require){
//  PosComponent es un componente base para extender lógica dentro
    const PosComponent = require("point_of_sale.PosComponent")
    const ProductItem = require("point_of_sale.ProductItem")
//  Permite registrar los componentes
    const Registries = require("point_of_sale.Registries")

    const CustomProductItem = ProductItem =>
        class extends ProductItem{
            constructor(){
                super(...arguments)
                console.log(this)
            }

            get stock_by_location(){
                var product_id = this.props.product.id
                var quants = this.env.pos.stock_by_product[product_id]
                return quants
            }
        }

//  Estamos registrando los cambios en el ProductItem
    Registries.Component.extend(ProductItem, CustomProductItem)
    return CustomProductItem
})