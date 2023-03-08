odoo.define('pos_Coupons.CouponButton', function (require) {
 "use strict";
   const { Gui } = require('point_of_sale.Gui');
   const PosComponent  = require('point_of_sale.PosComponent');
   const AbstractAwaitablePopup =    require('point_of_sale.AbstractAwaitablePopup');
   const Registries = require('point_of_sale.Registries');
   const ProductItem = require('point_of_sale.ProductItem');
   const ProductScreen = require('point_of_sale.ProductScreen');
class CouponButton extends PosComponent{
      //Generate popup
      display_popup_products() {
      var core = require('web.core');
      var _t = core._t;
       Gui.showPopup("CouponProductsPopup", {
       title : _t("Coupon Products"),
       confirmText: _t("Exit")
          });
      }
  }
  //Add coupon button and set visibility
      ProductScreen.addControlButton({
      component: CouponButton,
      condition: function() {
          return this.env.pos.config.coupon_category;
      },
  });
  Registries.Component.add(CouponButton);
  return CouponButton;
});