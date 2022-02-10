from odoo import fields, models, api

class Tasks(models.Model):
    _name = "ta.task"
    _description = "Tareas"

    name = fields.Char("Descripción")
    sequence = fields.Char("Sequence")