# -*- coding: utf-8 -*-

from odoo import models, fields

class ToDo(models.Model):
    _name = "todo.app" # Nombre dentro de la tabla dentro de la BD: todo_app
    _description = "Lista de Tareas" # Descripción para el sistema
    # rec_name sirve para indicar que atributo será mostrado, por defecto toma name
    # _rec_name = "state"

    # Atributos de la tabla
    name = fields.Char(string="Nombre")
    state = fields.Char(string="Estado")
    description = fields.Char(string="Descripción")


# from odoo import models, fields, api


# class todo_app(models.Model):
#     _name = 'todo_app.todo_app'
#     _description = 'todo_app.todo_app'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100
