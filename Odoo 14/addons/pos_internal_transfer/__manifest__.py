{
    "name": "Transferencia Interna desde el Punto de Venta",
    "depends": ["point_of_sale", "stock"],
    "data": [
        "views/assets.xml",
        "views/views.xml"
    ],
    "qweb": [
        "static/src/xml/products.xml",
        "static/src/xml/receipt_internal_transfer.xml",
        "static/src/xml/pos.xml"
    ]
}