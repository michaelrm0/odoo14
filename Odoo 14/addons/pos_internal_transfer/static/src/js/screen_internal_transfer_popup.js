odoo.define('pos_internal_transfer.screen_internal_transfer_popup', function(require){
    "use strict";

    var rpc = require('web.rpc')
    const Registries = require('point_of_sale.Registries')
    const { useListener } = require('web.custom_hooks')
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup')
    const { Gui } = require('point_of_sale.Gui')

    class PopupInternalTransferWidget extends AbstractAwaitablePopup {
        constructor(){
            super(...arguments);
        }

        mounted(){
            this.render_list()
        }

        render_list(){
            var self = this
            $("#table-body").empty()
            var lines = ["Tipo de Operación", "Ubicación de Origen", "Ubicación de Destino", "Estado"]
//            console.log(this)
//          Recogiendo valores
//            const warehouse = this.props.warehouse_id
            var warehouse_id = this.env.pos.picking_type.warehouse_id[0]
            var warehouse_name = this.env.pos.picking_type.warehouse_id[1]
            var products_to_transfer = this.props.products_to_transfer

            rpc.query({
                model: "pos.config",
                method: "get_values",
                args: [warehouse_id]
            }).then(function(result){
                var type_of_operations = result[0]
                var locations = result[1]
                var states = result[2]

//                console.log(states)
//                console.log(locations)

                for(var j=0; j<lines.length; j++){
                    var rows = ""
                    rows += `<tr><td>${lines[j]}</td></tr>`
    //              Entra al id=list de la tabla, luego va a la etiqueta tbody y realiza el appendTo, agrega los elementos
                    $(rows).appendTo("#list tbody")
    //                console.log(rows)
                }

                var table = document.getElementById("list");
    //            console.log(table)
                var tr = table.getElementsByTagName("tr");
//                console.log(tr)

                for(var i = 0; i < tr.length; i++){
                    var td = document.createElement("td")
                    var select = document.createElement("select")
                    select.setAttribute("id", `select-${i}`)

                    if(i == 0){

                        _.each(type_of_operations, function(type_of_operation){
                            var option = document.createElement("option")

                            option.setAttribute("value", `option-${type_of_operation.id}`)

                            var value = document.createTextNode(`${warehouse_name}: ${type_of_operation.name}`)
                            option.appendChild(value)
//                            console.log(option)
                            select.appendChild(option)
                        })
//                        console.log(select)

                        select.addEventListener('change', (event) => {
                            self.updatedLocations(event.target.value)
                        })
                    }

                    if(i == 1 | i == 2){
//                        var option = document.createElement("option")
//                        option.setAttribute("value", "option-0")
//                        var value = document.createTextNode("Seleccione")
//                        option.appendChild(value)
//                        select.appendChild(option)

                        _.each(locations, function(location){
                            var option = document.createElement("option")

                            option.setAttribute("value", `option-${location.id}`)

                            var value = document.createTextNode(location.complete_name)
                            option.appendChild(value)
//                            console.log(option)
                            select.appendChild(option)
                        })
                    }

                    if(i == 3){
                        _.each(states, function(state){
                            var option = document.createElement("option")

                            option.setAttribute("value", `option-${state.value}`)

                            var value = document.createTextNode(state.name)
                            option.appendChild(value)
//                            console.log(option)
                            select.appendChild(option)
                        })
                    }

                    td.appendChild(select)
                    tr[i].appendChild(td)
                }
            }).catch(function(error){
                alert("Ha ocurrido un error")
            })
        }

        updatedLocations(ev){
            var location_id = parseInt(ev.split("-")[1])
//            console.log(location_id)
            rpc.query({
                model: "pos.config",
                method: "get_locations",
                args: [location_id]
            }).then(function(result){
//                console.log(result)
                var location_src_id = result[0].default_location_src_id[0]
                var location_des_id = result[0].default_location_dest_id[0]
                $(document).ready(function(){
                  $("#select-1").val(`option-${location_src_id}`)
                  $("#select-2").val(`option-${location_des_id}`)
                })
            })
        }

        click_confirm() {
            var picking_type_id = parseInt((document.getElementById("select-0").value).split("-")[1])
            var location_id = parseInt((document.getElementById("select-1").value).split("-")[1])
            var location_dest_id = parseInt((document.getElementById("select-2").value).split("-")[1])
            var state_value = (document.getElementById("select-3").value).split("-")[1]

            var products_to_transfer = this.props.products_to_transfer
//          Corregir el id del usuario
//            var user_id = this.env.pos.config.current_user_id[0]
            var user_id = this.env.session.partner_id

            var matriz = []
            var products = _.map(products_to_transfer, function(el){
                return [0, 0, {
                    "name": el.product.display_name,
                    "product_id": el.product.id,
                    "product_uom_qty": el.quantity,
                    "product_uom": el.product.uom_id[0]
                }]
            })

            rpc.query({
                model: "stock.picking",
                method: "create",
                args: [{
                    "picking_type_id": picking_type_id,
                    "location_id": location_id,
                    "location_dest_id": location_dest_id,
                    "move_ids_without_package": products,
                    "partner_id": user_id,
                    "immediate_transfer": false
                }]
            }).then(function(transfer_id){
                console.log(transfer_id)
                if(state_value == "confirmed" | state_value == "assigned" | state_value == "done"){
                    rpc.query({
                        model: "stock.picking",
                        method: "action_confirm",
                        args: [transfer_id]
                    }).then(function(confirmed){
                        console.log(confirmed)
                        if(state_value == "assigned" | state_value == "done"){
                            rpc.query({
                                model: "stock.picking",
                                method: "action_assign",
                                args: [transfer_id]
                            }).then(function(value){
                                console.log(value)
                                if(state_value == "done"){
                                    rpc.query({
                                        model: "pos.config",
                                        method: "write_transfer",
                                        args: [transfer_id]
                                    }).then(function(form){
                                        console.log(form)
                                        rpc.query({
                                            model: "stock.picking",
                                            method: "button_validate",
                                            args: [transfer_id]
                                        }).then(function(done){
                                            console.log("HECHO")
                                            console.log(done)
                                        })
                                    })
                                }
                            })
                        }
                    })
                }
                Gui.showPopup('ConfirmInternalTransferWidget', {
                    transfer_id: transfer_id
                })
            }).catch(function(error){
                alert(error)
            })
        }
    }

    PopupInternalTransferWidget.template = 'PopupInternalTransferWidget'

//    PopupInternalTransferWidget.defaultProps = {
//        confirmText: 'Crear',
//        cancelText: 'Cancelar',
//        title: 'Confirm ?',
//        body: '',
//    }

    Registries.Component.add(PopupInternalTransferWidget)

    return PopupInternalTransferWidget
})