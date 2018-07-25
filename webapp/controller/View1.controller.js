sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.packageEXAMPLE_UI5.controller.View1", {
		
		onInit : function (){
			
			var oModel = new sap.ui.model.json.JSONModel("model/Clothing.json");
			this.getView().setModel(oModel);
		
		}
	});
});