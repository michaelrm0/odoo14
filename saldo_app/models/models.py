from odoo import fields, models, api
from odoo.exceptions import ValidationError
from datetime import datetime
from uuid import getnode as get_mac

class Movements(models.Model):
    _name = "sa.movements" # sa_movements
    _description = "Movimientos"
    # Es un hilo de mensajes, contiene ciertas funcionalidades
    _inherit = "mail.thread"

    name = fields.Char("Nombre", required=True)
    type_move = fields.Selection(selection=[("income", "Ingreso"), ("expense", "Gasto")], string="Tipo", default="income", required=True, tracking=True)
    date = fields.Datetime("Fecha", tracking=True)
    amount = fields.Float("Monto", tracking=True)
    receipt_image = fields.Binary("Foto del recibo")
    notes = fields.Html("Notas")

    currency_id = fields.Many2one("res.currency", default=162)

    user_id = fields.Many2one("res.users", "Usuario", default=lambda self: self.env.user.id)
    category_id = fields.Many2one("sa.categories", "Categoría")

    # sa_movements_sa_tags_rel <- esto se daría sin el segundo parámetro, postgresql
    # permite 40 caracteres para el nombre de la creación de una tabla
    tag_ids = fields.Many2many("sa.tags", "sa_mov_sa_tag_rel", "movement_id", "tag_id", string="Etiquetas")

    email = fields.Char(related="user_id.email", string="Correo electrónico")

    # Se realiza una regla de valicación para el campo amount
    @api.constrains("amount")
    def _check_amount(self):
        if not (self.amount >= 0 and self.amount <= 100000):
            raise ValidationError("El monto debe encontrarse entre 0 y 100 000")

    @api.onchange("type_move")
    def onchange_type_move(self):
        if (self.type_move == "income"):
            self.name = "Ingreso: "
        elif self.type_move == "expense":
            self.name = "Gasto: "

    @api.model
    def create(self, vals):
        name = vals.get("name", "-")
        amount = vals.get("amount", "0")
        type_move = vals.get("type_move", "")

        if type_move == "income":
            type_move = "Ingreso"
        elif type_move == "expense":
            type_move = "Gasto"

        date = vals.get("date", "")

        user = self.env.user
        count_movs = user.count_movements

        if count_movs >= 5 and user.has_group("saldo_app.res_groups_user_free"):
            raise ValidationError("Solo puedes crear 5 movimientos por mes")

        notes = """<p>Tipo de movimiento: {}</p><p>Nombre: {}</p><p>Monto: {}</p><p>Fecha: {}</p>"""
        vals["notes"] = notes.format(type_move, name, amount, date)

        return super(Movements, self).create(vals)

    def unlink(self):
        for record in self:
            if record.amount >= 50:
                d_mac = get_mac()
                mac = self.convertir_a_mac(self.decimal_a_hexadecimal(d_mac))
                raise ValidationError("Movimientos con monto mayor a 50 no podrán ser eliminados {}".format(mac))

        return super(Movements, self).unlink()

    def obtener_caracter_hexadecimal(self, valor):
        # Lo necesitamos como cadena
        valor = str(valor)
        equivalencias = {
            "10": "A",
            "11": "B",
            "12": "C",
            "13": "D",
            "14": "E",
            "15": "F",
        }
        if valor in equivalencias:
            return equivalencias[valor]
        else:
            return valor

    def decimal_a_hexadecimal(self, decimal):
        hexadecimal = ""
        while decimal > 0:
            residuo = decimal % 16
            verdadero_caracter = self.obtener_caracter_hexadecimal(residuo)
            hexadecimal = verdadero_caracter + hexadecimal
            decimal = int(decimal / 16)
        return hexadecimal

    def convertir_a_mac(self, hexadecimal):
        p1 = hexadecimal[0:2]
        p2 = hexadecimal[2:4]
        p3 = hexadecimal[4:6]
        p4 = hexadecimal[6:8]
        p5 = hexadecimal[8:10]
        p6 = hexadecimal[10:12]
        mac = "{}-{}-{}-{}-{}-{}".format(p1, p2, p3, p4, p5, p6)
        return mac


class Categories(models.Model):
    _name = "sa.categories" # sa_categories
    _description = "Categorías"

    name = fields.Char("Nombre")
    type_move = fields.Selection(selection=[("income", "Ingreso"), ("expense", "Gasto")], string="Tipo", default="income", required=True)

    def view_movements(self):
        return {
            "type": "ir.actions.act_window",
            "name": "Movimientos de categoría: " + self.name,
            "res_model": "sa.movements",
            # Son el conjunto de vistas que están permitidas para esta acción de ventana
            # False hace referencia a un id
            "views": [[False, "tree"]],
            # La forma en que se va a visualizar, new va a listar en un modal dentro de la misma ventana
            # La forma en que se va a visualizar, self va a listar en una nueva ventana, avanzando en la ruta de la ventana inicial
            "target": "self",
            "domain": [["category_id", "=", self.id]]
        }

class Tags(models.Model):
    _name = "sa.tags" # sa_tags
    _description = "Etiquetas"

    name = fields.Char("Nombre")
    type_move = fields.Selection(selection=[("income", "Ingreso"), ("expense", "Gasto")], string="Tipo",default="income", required=True)

class ResUsers(models.Model):
    _inherit = "res.users"

    movement_ids = fields.One2many("sa.movements", "user_id")
    total_incomes = fields.Float("Total de ingresos", compute="_compute_movements")
    total_expenses = fields.Float("Total de gastos", compute="_compute_movements")
    count_movements = fields.Integer("Cantidad de movimientos por mes", compute="_compute_movements")

    # cada vez que haya un cambio en el campo movements_ids, ya sea que se modifique, agregue o elimine un registro
    # se ejecutará esta función
    @api.depends("movement_ids")
    def _compute_movements(self):
        for record in self:
            record.total_incomes = sum(record.movement_ids.filtered(lambda r: r.type_move == "income").mapped("amount"))
            record.total_expenses = sum(record.movement_ids.filtered(lambda r: r.type_move == "expense").mapped("amount"))
            mes = datetime.now().month
            print(datetime.now())
            movements = record.movement_ids.filtered(lambda r: r.create_date.month == mes)
            record.count_movements = len(movements)

    def my_account(self):
        return {
            "type": "ir.actions.act_window",
            "name": "Mi cuenta",
            "res_model": "res.users",
            "res_id": self.env.user.id,
            "target": "self",
            "views": [(False, "form")]
        }