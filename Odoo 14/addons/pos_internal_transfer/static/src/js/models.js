odoo.define('pos_internal_transfer.models', function(require){
    var models = require("point_of_sale.models")
    var PosModel = models.PosModel

//  Capturando el nombre del almacén desde que se ingresa al POS para obtener sus tipos de operaciones
    _.find(PosModel.prototype.models, function(el){
        return el.model == "stock.picking.type"
//     Agregamos el warehouse_id para usarlo en las vistas
    }).fields.push("warehouse_id")

    PosModel.prototype.models.push({
        model: "stock.quant",
//      id: identificador de registro
//      product_id: id del producto
//      available_quantity: stock disponible por almacén
//      location_id: indica la ubicación interna de un almacén a la que pertenece un producto
        fields: ["id", "product_id", "available_quantity", "location_id"],
        domain: function(self){
            if(self.config.location_id != undefined){
                return [["location_id", "=", self.config.location_id[0]]]
            }else{
                return [["location_id", "=", False]]
            }
        },
        loaded: function(self, quants){
            self.stock_by_product = {}
            _.each(quants, function(el){
                if(self.stock_by_product[el.product_id[0]] == undefined){
                    self.stock_by_product[el.product_id[0]] = [el]
                }else{
                    self.stock_by_product[el.product_id[0]].push(el)
                }
            })
        }
    })

    console.log(PosModel)
})