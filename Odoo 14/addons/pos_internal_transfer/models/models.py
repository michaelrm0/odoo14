from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import base64

class PosConfig(models.Model):
    _inherit = "pos.config"

    # show_internal_stock_transfer = fields.Boolean("Transferencia interna del stock")
    # show_stock_by_location = fields.Boolean("Mostrar stock por ubicación")

    # Se hace un filtro para que las ubicaciones que muestre sean internas
    location_id = fields.Many2one("stock.location", "Ubicación", domain=[("usage", "=", "internal")])

    @api.model
    def get_values(self, warehouse_id):

        type_of_operations = self.env["stock.picking.type"].search_read([("warehouse_id", "=", warehouse_id)], ["name"])
        locations = self.env["stock.location"].search_read([], ["complete_name"])
        states = [
            {"value": "draft", "name": "Borrador"},
            # {"value": "waiting", "name": "Esperando otra operación"},
            {"value": "confirmed", "name": "En espera"},
            {"value": "assigned", "name": "Listo"},
            {"value": "done", "name": "Hecho"}
            # {"value": "cancel", "name": "Cancelado"}
        ]

        content = [type_of_operations, locations, states]
        return content

    @api.model
    def get_locations(self, type_of_operation_id):
        locations = self.env["stock.picking.type"].search_read([("id", "=", type_of_operation_id)], ["name", "default_location_src_id", "default_location_dest_id"])
        return locations

    @api.model
    def get_transfer_data(self, transfer_id):
        transfer_data = self.env["stock.picking"].search_read([("id", "=", transfer_id)])
        return transfer_data

    @api.model
    def write_transfer(self, transfer_id):
        # self.env.cr.commit()
        transfer_ids = self.env["stock.picking"].search_read([("id", "=", transfer_id)], ["move_line_ids_without_package"])
        for value in transfer_ids[0]["move_line_ids_without_package"]:
            stock_move = self.env["stock.move.line"].search_read([("id", "=", value)])
            self.env["stock.move.line"].browse(value).write({"qty_done": stock_move[0]["product_uom_qty"]})
            self.env.cr.commit()

    @api.model
    def create(self, values):
        try:
            picking_type_id = values.get("picking_type_id", "")
            location = self.env["stock.picking.type"].search_read([("id", "=", picking_type_id)], ["default_location_src_id"])
            values["location_id"] = location[0]["default_location_src_id"][0]
        except Exception as e:
            raise ValidationError(e)

        res = super(PosConfig, self).create(values)
        return res

    def write(self, values):
        try:
            picking_type_id = values.get("picking_type_id", "")
            location = self.env["stock.picking.type"].search_read([("id", "=", picking_type_id)], ["default_location_src_id"])
            values["location_id"] = location[0]["default_location_src_id"][0]
        except Exception as e:
            raise ValidationError(e)

        res = super(PosConfig, self).write(values)
        return res

# class PosOrder(models.Model):
#     _inherit = "pos.order"
#
#     def action_receipt_internal_transfer(self, name, email, ticket):
#         if not self:
#             return False
#         if not email:
#             return False
#
#         message = _("<p>Dear %s,<br/>Here is your electronic ticket for the %s. </p>") % (email, name)
#         filename = 'Recibo-Transferencia-Interna-hola.jpg'
#         receipt = self.env['ir.attachment'].create({
#             'name': filename,
#             'type': 'binary',
#             'datas': ticket,
#             'res_model': 'pos.order',
#             'res_id': self.ids[0],
#             'store_fname': filename,
#             'mimetype': 'image/jpeg',
#         })
#         mail_values = {
#             'subject': _('Recibo de Transferencia Interna %s', name),
#             'body_html': message,
#             'author_id': self.env.user.partner_id.id,
#             'email_from': self.env.company.email or self.env.user.email_formatted,
#             'email_to': email,
#             'attachment_ids': [(4, receipt.id)],
#         }
#
#         if self.mapped('account_move'):
#             report = self.env.ref('point_of_sale.pos_invoice_report')._render_qweb_pdf(self.ids[0])
#             filename = name + '.pdf'
#             attachment = self.env['ir.attachment'].create({
#                 'name': filename,
#                 'type': 'binary',
#                 'datas': base64.b64encode(report[0]),
#                 'store_fname': filename,
#                 'res_model': 'pos.order',
#                 'res_id': self.ids[0],
#                 'mimetype': 'application/x-pdf'
#             })
#             mail_values['attachment_ids'] += [(4, attachment.id)]
#
#         mail = self.env['mail.mail'].sudo().create(mail_values)
#         mail.send()