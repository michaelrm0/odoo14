from odoo import models, fields
class PosCoupons(models.Model):
   _inherit = 'pos.config'
   _description = 'Pos Coupons'
   category_id = fields.Many2one('pos.category', string="Category")
   coupon_category = fields.Boolean(string="Coupon Category", default=False)