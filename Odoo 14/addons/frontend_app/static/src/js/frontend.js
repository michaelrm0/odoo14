odoo.define('frontend_app.frontend_widget', function(require){
//  Se están abstrayendo las librerías sgtes
//  AbstractAction sirve para la creación de acciones de cliente
    var AbstractAction = require("web.AbstractAction")
//  Tiene cierta función para añadir registros a la lista de opciones que tiene odoo
    var core = require("web.core")

//  Se está extendiendo y creando una especie de componente y llama al template frontend_template
    var FrontendAction = AbstractAction.extend({
        template: "frontend_template",
        events:{
            "click .btn_add_task": "add_task",
            "click button[name='delete_task']": "unlink_task",
            "keydown input[name='task']": "onKeydownTask"
        },
        start:function(){
            this._super()
//          Llama a fetchTasks para cargar las tareas guardadas en el modelo
            this.fetchTasks()
        },
        renderTemplate: function(){

        },
        fetchTasks: function(){
//          Remote Procedure Call (rpc)
//          Agregando las tareas cargadas del modelo
            var list_tasks = $(this.$el).find(".list_tasks")
            this._rpc({
                model: "ta.task",
                method: "search_read",
                args: [],
                kwargs: {}
            }).then(function(tasks){
                _.each(tasks, function(task){
                    list_tasks.append("<li>" + task.name + " <button name='delete_task' value='" + task.id + "'>Eliminar tarea</button></li>")
//                    console.log(task.id)
                })
            })
        },
//      Función creada por estar definida en el evento del click a btn_add_task
        add_task: function(ev){
            var self = this
//          Sirve para obtener datos de la plantilla
            var new_task = $(this.$el).find("input[name='task']").val()
            if(new_task != ""){
                this._rpc({
                    model: "ta.task",
                    method: "create",
                    args: [{"name": new_task}],
                    kwargs: {}
                }).then(function(res){
                    if(res){
                        self._rpc({
                            model: "ta.task",
                            method: "search_read",
                            args: [[['id', '=', res]]],
                            kwargs: {}
                        }).then(function(task){
                        console.log(task)
                            var list_tasks = $(self.$el).find(".list_tasks")
                            list_tasks.append("<li>" + task[0].name + " <button name='delete_task' value='" + task[0].id + "'>Eliminar tarea</button></li>")
                            $(self.$el).find("input[name='task']").val("")
                        })
                    }
                })
            } else {
                alert("Está intentando agregar una tarea vacía")
            }
        },
        unlink_task: function(ev){
            var self = this
            var task_id = ev.target.value

            this._rpc({
                model: "ta.task",
                method: "unlink",
                args: [task_id],
                kwargs: {}
            }).then(function(res){
                if(res){
                    var list_tasks = $(self.$el).find(".list_tasks")
                    list_tasks.empty()
                    self._rpc({
                        model: "ta.task",
                        method: "search_read",
                        args: [],
                        kwargs: {}
                    }).then(function(tasks){
                        _.each(tasks, function(task){
                            list_tasks.append("<li>" + task.name + " <button name='delete_task' value='" + task.id + "'>Eliminar tarea</button></li>")
                        })
                    })
                }
            })
        },
        onKeydownTask: function (ev) {
            if(ev.which === $.ui.keyCode.ENTER){
                this.add_task()
            }
        }
    })
    console.log(FrontendAction)

//  Se está registrando el registro name de la acción de cliente y se está vinculando a su acción de cliente FrontendAction
    core.action_registry.add("frontend_widget", FrontendAction)
    return FrontendAction
})