# -*- coding: utf-8 -*-

from odoo import http

class SaldoApp(http.Controller):
    @http.route('/saldo_app', auth='public', website=True)
    def index(self, **kw):
        return http.request.render('saldo_app.index', {})