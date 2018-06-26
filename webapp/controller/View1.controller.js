sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.packageEXAMPLE_UI5.controller.View1", {
		
		onInit : function (){
			
			var url = "https://jsonplaceholder.typicode.com/users";
			
			var empJSONDataSet = new sap.ui.model.json.JSONModel(url);
			
			console.log("DATA");
			console.log(empJSONDataSet);
			
		}
	});
});