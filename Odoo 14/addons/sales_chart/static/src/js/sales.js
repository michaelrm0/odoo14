odoo.define("sales_chart.chart", function(require){
    var AbstractAction = require("web.AbstractAction")
    var core = require("web.core")

    var states = {
        "sent": "Cotización Enviada",
        "draft": "Borrador",
        "sale": "Órdenes de Venta"
    }

    var SalesChart = AbstractAction.extend({
        template: "tmpl_sales_chart",
        events: {
            "change .state": "change_sale_state"
        },
        start: function(){
            var self = this
            self.canva_chart = undefined
            self._super()
//          nos va a lanzar un callback, cuando este elemento haya sido renderizado
//          Con esto nos aseguramos que la función renderChart se ejecute cuando ya haya sido cargado al DOM el xml/sales.xml
            core.bus.on("DOM_updated", this, function(){
                /*
                    [
                        {"state": "draft", "sum": 89.5},
                        {"state": "sent", "sum": 894.5},
                        {"state": "sale", "sum": 829.5},
                    ]
                */
                self.fetch_group_by_state().then(function(lines){
//                  lines recibe el amount_total con su state correspondiente
//                  Está variable se convierte en global por estar definida en el método start
                    self.lines = lines
//                  Acá pinta en el gráfico con los datos que dan como resultado a las consultas sql
                    self.renderChart(lines)
                })
            })
//            self.renderChart()
        },
        fetch_group_by_state: function(){
            return this._rpc({
                model: "sale.order",
//              Es el valor del método definido en el models
                method: "group_by_state",
                args: [],
                kwargs: {}
            })
        },
        renderChart: function(lines){
    //      Odoo tiene por defecto underscorejs
            const ctx = document.getElementById('myChartPie').getContext('2d');

            if(self.canva_chart){
                self.canva_chart.destroy()
            }
            self.canva_chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: _.map(lines, function(el){ return states[el.state] }),
                    datasets: [{
                        label: 'Ventas por Estado',
                        data: _.map(lines, function(el){ return el.sum }),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            })
        },
//      Se ejecutará cuando haya un cambio en los checkbox
        change_sale_state: function(ev){
//            console.log($(ev.currentTarget).data("name"))
//            console.log($(ev.currentTarget).is(":checked"))

            var states_permitted = _.filter($(".state"), function(el){
                return $(el).is(":checked")
            })
            states_permitted = _.map(states_permitted, function(el){
                return $(el).data("name")
            })
            console.log(states_permitted)
            var lines = _.clone(this.lines)
            console.log(lines)
            lines = _.filter(lines, function(el){
//              Si el.state se encuentra dentro de states_permitted
                console.log(el.state)
                return states_permitted.indexOf(el.state) >= 0
            })
            console.log(lines)
            this.renderChart(lines)
        }
    })

    core.action_registry.add("sales_chart", SalesChart)
})