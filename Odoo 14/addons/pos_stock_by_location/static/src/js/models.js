odoo.define('pos_stock_by_location.models', function(require){
//  BACKBONE ES EXTENDIDO A POSMODEL
//  Traemos con el nombre definido point_of_sale/static/src/js/models.js, de esta manera obtenemos la data de ahí
    var models = require("point_of_sale.models")
//  Obtenemos lo que dice exports.PosModel
    var PosModel = models.PosModel
//    console.log(PosModel.prototype.models)

//  Estamos agregando un campo extra a los valores que tiene por defecto en el models.js del módulo de point_of_sale
//  qty_available es la suma de los stock de cada almacén de un producto
    _.find(PosModel.prototype.models, function(el){
        return el.model == "product.product"
    }).fields.push("qty_available")
//    console.log(_.find(PosModel.prototype.models, function(el){
//        return el.model == "product.product"
//    }))

//  Estamos agregando una tabla extra a los valores que tiene por defecto en el models.js del módulo de point_of_sale
    PosModel.prototype.models.push({
//      Hacemos referencia al modelo stock.quant para obtener el stock de un producto por almacén
        model: "stock.quant",
//      Estos son los campos que quiero que se descarguen del modelo stock.quant
        fields: ["id", "product_id", "available_quantity", "location_id"],
        domain: function(self){
//            console.log(self)
            if(self.config.location_id != undefined){
                return [["location_id", "=", self.config.location_id[0]]]
            }else{
                return [["location_id", "=", False]]
            }
        },
//      Descarga los datos, siempre tiene 2 parámetros, recibe todas las descargas de este modelo
        loaded: function(self, quants){
//          self es el objeto mismo, donde se encuentra el entorno del punto de venta
//          quants es lo que va a contener lo que se ha descargado
//            console.log(quants)
//          Para almacenar el valor de quants que viene a ser todos los productos que se encuentran en la ubicación interna definida
            self.quants = quants
//            console.log(self)
//          Creamos una instancia stock_by_product en el objeto self
            self.stock_by_product = {}
//          Iterara el valor de quants
            _.each(quants, function(el){
//              Si esto sucede quiere decir que aún no se ha creado ese registro
                if(self.stock_by_product[el.product_id[0]] == undefined){
                    self.stock_by_product[el.product_id[0]] = [el]
                }else{
                    self.stock_by_product[el.product_id[0]].push(el)
                }
            })
//            console.log(self)
        }
    })
})