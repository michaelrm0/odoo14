from odoo import models, fields

class PosConfig(models.Model):
    _inherit = "pos.config"

    show_stock_by_location = fields.Boolean("Mostrar stock por ubicación")

    # Se hace un filtro para que las ubicaciones que muestre sean internas
    location_id = fields.Many2one("stock.location", "Ubicación", domain=[("usage", "=", "internal")])

