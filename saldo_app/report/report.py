from odoo import models, api
from datetime import datetime

class ReportDetailMovement(models.AbstractModel):
    _name = "report.saldo_app.report_detail_movement"

    @api.model
    def _get_report_values(self, docids, data=None):
        docs = self.env["sa.movements"].browse(docids)
        docargs = {
            "docs": docs,
            "fecha": datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        }

        return docargs