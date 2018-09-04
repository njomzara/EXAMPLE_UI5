sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/viz/ui5/data/FlattenedDataset"
], function(Controller, MessageToast, FlattenedDataset) {
	"use strict";

	return Controller.extend("com.packageEXAMPLE_UI5.controller.View1", {
		
		oFuncOverview : null,
		oTLAvailableCol : null, // Available Columns Model
		oTLVisibleCol : null, // Visible Columns Model
		aSelColumns : [],
		treeTable : null,
		lVisColumns: null,
		propertyPath : "",
		nodeSelected : false,
		btnAddNode : null,
		btnDeleteNode : null,
		searchValue : "",
		searchHitsPositions : [],
		currentHitPosition : 0,
		dTTLayout : null,
		dTTLayoutID : "dTTLayoutID",
	
		onInit : function (){
			
			// Init Objects
			this.treeTable = this.getView().byId("exampleTreeTable");
			this.btnAddNode = this.getView().byId("btnAddNode");
			this.btnDeleteNode = this.getView().byId("btnDeleteNode");
			this.tbSearch = this.getView().byId("tbSearch");
			this.sfSearch = this.getView().byId("sfSearch");
			this.saMainLayout = this.getView().byId("saMainLayout");
			
			// Set Object Properties
			// Full height of the TreeTable
			this.treeTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Auto);
			
			// Set Model for tree table
			this.oFuncOverview = new sap.ui.model.json.JSONModel("model/Functions.json");
			this.getView().setModel(this.oFuncOverview);
		},
		
		onAfterRendering : function() {
			// Expand Tree Table to Lvl 3
			this.treeTable.expandToLevel(3);
		},
		
		onRowSelectionChange : function(event){
			if(event.getParameter("rowContext") !== null){
				this.propertyPath = event.getParameter("rowContext").sPath;
				this.nodeSelected = true;
			}
		},
		
		// Add node to the TreeTable
		addNode : function(){
			
			if(!this.nodeSelected){
				MessageToast.show("You must select existing node in order to insert a new one!");
				return;
			}
			
			this._newBusinessFunctionDialog().open();
		},
		
		// Delete node from the TreeTable
		deleteNode : function(){
			
			if(!this.nodeSelected){
				MessageToast.show("You must select node first!");
				return;
			}
			
			var path = this.propertyPath.substring(0, this.propertyPath.lastIndexOf("/"));
			var index = this.propertyPath.substring(this.propertyPath.lastIndexOf("/") + 1, this.propertyPath.length);
			var node = this.oFuncOverview.getProperty(path);
		
			node.splice(index, 1);
		
			this.oFuncOverview.setProperty(path, node);
			this.treeTable.clearSelection();
			this.nodeSelected = false;
		},
		
		 _newBusinessFunctionDialog : function() {
            // create a fragment with dialog, and pass the selected data
            if (!this.dialog) {
                // This fragment can be instantiated from a controller as follows:
                this.dialog = sap.ui.xmlfragment(
                		"nbfDialog",
                		"com.packageEXAMPLE_UI5.view.NewBusinessFunctionDialog",
                		this);
                //debugger;
            }
            //debugger;
            return this.dialog;
        },
        
        moveColRight : function() {
        	this.search.moveColumnRight(this);
        },
        
        moveColLeft : function() {
    		this.search.moveColumnLeft(this);
        },
        
        showSearchNext : function() {
    		this.search.showNext(this);
        },
        
        showSearchPrevious : function() {
    		this.search.showPrevious(this);
        },
        
        cancelNbf : function() {
           this._newBusinessFunctionDialog().close();
        },
        
        cancelMttl : function() {
           this._maintainTreeTableDialog().close();
        },
        
        createNbf : function() {
            
            var path = "";
            var icon = "";
	        var nbfName = sap.ui.getCore().byId("nbfDialog--inputFunctionName").getValue();
	        var nbfLevel = sap.ui.getCore().byId("nbfDialog--nbfLevel").getSelectedButton().getText();
	        var nbfType = sap.ui.getCore().byId("nbfDialog--selectNbfType").getSelectedItem().getText();
	       
	    	if(nbfLevel === "Same Level"){
				path = this.propertyPath.substring(0, this.propertyPath.lastIndexOf("/")); 
			}else{
				path = this.propertyPath + "/categories";
			}
			
			switch (nbfType) {
			    case "View":
			        icon = "sap-icon://table-view";
			        break;
			    case "Pivot":
			        icon = "sap-icon://table-chart";
			        break;
			    case "Union":
			        icon = "sap-icon://exit-full-screen";
			        break;
			    default:
			        icon = "";
			}
			
			var node = this.oFuncOverview.getProperty(path);
	
			node.push({"name": "" + nbfName + "",
					   "status" : "sap-icon://circle-task",
					   "function_id" : "217556",
					   "icon" : "" + icon + "",
					   "categories": []});

            this.oFuncOverview.setProperty(path, node);
            
			this.nodeSelected = false;
			this.treeTable.clearSelection();
	    	this._newBusinessFunctionDialog().close();
        },
        
    	onDragStart: function(oEvent) {
    		
    		if(!this.displayChangeFlag){ // If Display/Change mode is not active
    			return; 				 // Return
    		}
    		
			var oTreeTable = this.byId("exampleTreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRow = oEvent.getParameter("target");
			var iDraggedRowIndex = oDraggedRow.getIndex();
			var aSelectedIndices = oTreeTable.getSelectedIndices();
			var aDraggedRowContexts = [];

			if (aSelectedIndices.length > 0) {
				// If rows are selected, do not allow to start dragging from a row which is not selected.
				if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
					oEvent.preventDefault();
				} else {
					for (var i = 0; i < aSelectedIndices.length; i++) {
						aDraggedRowContexts.push(oTreeTable.getContextByIndex(aSelectedIndices[i]));
					}
				}
			} else {
				aDraggedRowContexts.push(oTreeTable.getContextByIndex(iDraggedRowIndex));
			}

			oDragSession.setComplexData("hierarchymaintenance", {
				draggedRowContexts: aDraggedRowContexts
			});
			this.onSearch();
		},

		onDrop: function(oEvent) {
			var oTreeTable = this.byId("exampleTreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedRow = oEvent.getParameter("droppedControl");
			var aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;
			var oNewParentContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());

			if (aDraggedRowContexts.length === 0 || !oNewParentContext) {
				return;
			}

			var oModel = oTreeTable.getBinding("rows").getModel();
			var oNewParent = oNewParentContext.getProperty();

			// In the JSON data of this example the children of a node are inside an array with the name "categories".
			if (!oNewParent.categories) {
				oNewParent.categories = []; // Initialize the children array.
			}

			for (var i = 0; i < aDraggedRowContexts.length; i++) {
				if (oNewParentContext.getPath().indexOf(aDraggedRowContexts[i].getPath()) === 0) {
					// Avoid moving a node into one of its child nodes.
					continue;
				}

				// Copy the data to the new parent.
				oNewParent.categories.push(aDraggedRowContexts[i].getProperty());

				// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
				oModel.setProperty(aDraggedRowContexts[i].getPath(), undefined, aDraggedRowContexts[i], true);
			}
		},
		
		 _maintainTreeTableDialog : function() {
            // create a fragment with dialog, and pass the selected data
            if (!this.dTTLayout) {
                // This fragment can be instantiated from a controller as follows:
                this.dTTLayout = sap.ui.xmlfragment(
                					this.dTTLayoutID,
                					"com.packageEXAMPLE_UI5.view.TreeTableLayoutDialog",
                					this);
                //debugger;
            }
            //debugger;
            return this.dTTLayout;
        },
		
		showTTLayoutMaintenance : function (){
			
			this._maintainTreeTableDialog().open(); // Open TreeTable Maintenance Dialog
			this.search.tAvlColumns = sap.ui.core.Fragment.byId(this.dTTLayoutID, "tAvlColumns"); // Initialize Left Dialog Column
			this.search.tVisColumns = sap.ui.core.Fragment.byId(this.dTTLayoutID, "tVisColumns"); // Initialize Right Dialog Column
		
			this.oTLVisibleCol = new sap.ui.model.json.JSONModel("model/TTVisibleColumns.json");
			this.dTTLayout.setModel(this.oTLVisibleCol, "TTVisibleColumns");
			this.oTLAvailableCol = new sap.ui.model.json.JSONModel("model/TTAvailableColumns.json");
			this.dTTLayout.setModel(this.oTLAvailableCol, "TTAvailableColumns");
			
			this.dTTLayout.setContentWidth("60%");
			this.dTTLayout.setContentHeight("80%");
			
			var columns = this.treeTable.getColumns();
		},
		
		showHideMasterPane : function () {
	
		},
/************************* SEARCH RELATED *************************************/	
		// Execute Search - Fired when:
		// - Seach executed
		// - First Visible row changed (onSrcoll)
		onSearch : function(event) {
			
			var array = [];
			this.util.flattenedJSON = [];
			this.searchHitsPositions = [];
			
			this.searchValue = this.sfSearch.getValue();
			
			// Flatten the JSON and store Search hits model position in a array
    		this.util.fllatenJSON(this.oFuncOverview.getData());
    		array = this.util.flattenedJSON;
    	
    		for (var i = 0; i < array.length; i++) {
    			var name = array[i]["name"];
    			 if (name.includes(this.searchValue)){
    			 	this.searchHitsPositions.push(i);
    			 }
    		}
    		
			if(this.searchValue.length === 0){
				return;
			}else if(this.searchValue.length > 3) {
				this.search.markTreeTableHits(this);
				// Mark first position in the model and set the first hit as first visible row
            	this.currentHitPosition = 0;
            	this.treeTable.setFirstVisibleRow(this.searchHitsPositions[this.currentHitPosition]);
			}else{
				MessageToast.show("Search String has to have more than 3 characters!");
			}
        },
        onTreeTableScroll : function(event) {
			this.search.markTreeTableHits(this);
		},
        // Show hide Search Bar
    	showHideSearch : function() {
    		
			if(this.tbSearch.getVisible()){				// If Search Toolbar is visible
				this.tbSearch.setVisible(false);		// Set Search Toolbar to invisible
				this.search.clearTreeTableHits(this);
			}else{										// If Search Toolbar is invisible
				this.tbSearch.setVisible(true);			// Set Search Toolbar to visible
			}
			this.search.clearTreeTableHits(this);		
		},
  
		displayChangeFlag : false,						// Display/change mode status (initial - inactive)
		displayChange : function() {
		
			if(!this.displayChangeFlag){				// If Display/Change mode was inactive
				this.btnAddNode.setVisible(true);		// Show Add Node Button
				this.btnDeleteNode.setVisible(true);	// Show Delete Node Button
				//this.treeTable.setSelectionMode('Single');
				this.tbSearch.setVisible(false);		// Hide Search Toolbar
				this.displayChangeFlag = true;			// Set Display/Change mode to active
			}else{										// If Display/Change mode was active
				this.btnAddNode.setVisible(false);		// Hide Add Node Button
				this.btnDeleteNode.setVisible(false);   // Hide Delete Node Button
				this.displayChangeFlag = false; 		// Set Display/Change mode to inactive
				//this.treeTable.setSelectionMode('None');
			}
			
		},
		/**************************************************************************/
		/************************* SEARCH OBJECT **********************************/
		/**************************************************************************/
		search : {
			tAvlColumns : null,
			tVisColumns : null,
			avlTabItemsPath : "/data",
			aColSelectedItems : [],
			visTableItemsPath : "/data",
			vColSelectedItems : [],
			markTreeTableHits : function(context){
				if(context.sfSearch.getValue().length <= 0){return;}
	            var rowCount = context.treeTable.getVisibleRowCount(); // Number of visible rows
	            var rowStart = context.treeTable.getFirstVisibleRow(); // Starting Row index
	            var currentRowContext;
	            
	            for (var i = 0; i < rowCount; i++) {
	            	
	            	var cssClass = "searchHitBackgorund";
	            	
            		currentRowContext = context.treeTable.getContextByIndex(rowStart + i); //content
	                context.treeTable.getRows()[i].$().removeClass(cssClass);
					
	                var cellValue = context.oFuncOverview.getProperty("name", currentRowContext); // Get Amount
	                
	                if (cellValue === null){
	                	return;
	                }
	                
	                if (cellValue.includes(context.searchValue)) {
	                	context.treeTable.getRows()[i].$().addClass(cssClass);
	                } 
	            }
			},
			clearTreeTableHits : function(context){
				
				context.sfSearch.setValue("");
				var rowCount = context.treeTable.getVisibleRowCount(); //number of visible rows
				for (var i = 0; i < rowCount; i++) {
	            	
	            	var cssClass = "searchHitBackgorund";
	            	
	            	if(i === 1){
	            		cssClass = "firstSearchHitBackgorund";
	            	}
	            	
	                // Remove Style class else it will overwrite
	                context.treeTable.getRows()[i].$().removeClass(cssClass);
	            }	
			},
			showNext : function (context) {
				if(context.currentHitPosition + 1 >= context.searchHitsPositions.length){
					return;
				}
				context.currentHitPosition = context.currentHitPosition + 1;
				context.treeTable.setFirstVisibleRow(context.searchHitsPositions[context.currentHitPosition]);
				this.markTreeTableHits(context);
			},
			showPrevious : function (context) {
				if (context.currentHitPosition <= 0) {
					return;
				}
				context.currentHitPosition = context.currentHitPosition - 1;
				context.treeTable.setFirstVisibleRow(context.searchHitsPositions[context.currentHitPosition]);
				this.markTreeTableHits(context);
			},
			moveColumnRight : function(context) {
				
				this.aColSelectedItems = []; // Reset array
				
				var selRows = this.tAvlColumns.getSelectedItems();
				var selRowsIndex = []; // Selected row indexes
				var selRowsCell0 = []; // Selected row cell 0 content
				var selRowsCell1 = []; // Selected row cell 1 content
				
				for (var a = 0; a < selRows.length; a++) {
					// Store row data before deletion from model
					selRowsIndex.push(this.tAvlColumns.indexOfItem(selRows[a]));     // Store selected row indexes
					selRowsCell0.push(selRows[a].getCells()[0].getProperty("text")); // Store selected row cell 0 content
					selRowsCell1.push(selRows[a].getCells()[1].getProperty("text")); // Store selected row cell 1 content
				}
				
				// Remove selected items from the left table
				for (var i = 0; i < selRows.length; i++) {
					
					var nodeA = context.oTLAvailableCol.getProperty(this.avlTabItemsPath);
					this.aColSelectedItems.push({"position" : 0,
												 "name" : selRowsCell0[i],
												 "width" : selRowsCell1[i]}
												 );
					nodeA.splice(selRowsIndex[i] - i, 1);
					context.oTLAvailableCol.setProperty(this.avlTabItemsPath, nodeA);
				}
			
				// Add selected items to the right table
				for (var y = 0; y < this.aColSelectedItems.length; y++) {
					var nodeB = context.oTLVisibleCol.getProperty(this.visTableItemsPath);
					
					nodeB.push({"position" : this.aColSelectedItems[y].position,
								"name" : this.aColSelectedItems[y].name,
							    "width" : this.aColSelectedItems[y].width
					});
					context.oTLVisibleCol.setProperty(this.visTableItemsPath, nodeB);
				}
					
				this.tAvlColumns.removeSelections(true);
			},
			moveColumnLeft : function(context) {
			
				this.vColSelectedItems = []; // Reset array
				
				var selRows = this.tVisColumns.getSelectedItems(); // Get Selected Rows Object
				var selRowsIndex = []; // Selected row indexes
				var selRowsCell0 = []; // Selected row cell 0 content
				var selRowsCell1 = []; // Selected row cell 1 content
				
				for (var a = 0; a < selRows.length; a++) {
					// Store row data before deletion from model
					selRowsIndex.push(this.tVisColumns.indexOfItem(selRows[a]));     // Store selected row indexes
					selRowsCell0.push(selRows[a].getCells()[0].getProperty("text")); // Store selected row cell 0 content
					selRowsCell1.push(selRows[a].getCells()[1].getProperty("text")); // Store selected row cell 1 content
				}
				
				// Remove selected items from the left table
				for (var i = 0; i < selRows.length; i++) {
					
					var nodeA = context.oTLVisibleCol.getProperty(this.visTableItemsPath);
					this.vColSelectedItems.push({"position" : 0,
												 "name" : selRowsCell0[i],
												 "width" : selRowsCell1[i]}
												 );
					nodeA.splice(selRowsIndex[i] - i, 1);
					context.oTLVisibleCol.setProperty(this.visTableItemsPath, nodeA);
				}
			
				// Add selected items to the right table
				for (var y = 0; y < this.vColSelectedItems.length; y++) {
					var nodeB = context.oTLAvailableCol.getProperty(this.avlTabItemsPath);
					
					nodeB.push({"position" : this.vColSelectedItems[y].position,
								"name" : this.vColSelectedItems[y].name,
							    "width" : this.vColSelectedItems[y].width
					});
					context.oTLAvailableCol.setProperty(this.avlTabItemsPath, nodeB);
				}
					
				this.tVisColumns.removeSelections(true);
			}
		},
		
		util : {
			flattenedJSON : [],
			getJSONDepth : function (obj) {
			    var depth = 0;
			    var context = this;
			    if (obj.categories) {
			    	obj.categories.forEach(function (d) {
			        	var tmpDepth = context.getJSONDepth(d);
			            if (tmpDepth > depth) {
			                depth = tmpDepth;
			            }
			        });
			    }
			    return 1 + depth;
			},
			fllatenJSON : function (obj) {
			    var context = this;
			    if (obj.categories) {
			    	obj.categories.forEach(function (d) {
			    		context.flattenedJSON.push(d);
			    		context.fllatenJSON(d);
			        });
			    }
			}
		}
	});
});