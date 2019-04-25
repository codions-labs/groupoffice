go.grid.GridTrait = {
//	/**
//	 * If the end of the list is within this number of pixels it will request the next page	
//	 */
//	scrollBoundary: 300,
//	
//	pageSize: 20,
	
	scrollUp: false,  // set to true when you need to loadMore when scrolling up
	
	initGridTrait : function() {
		if (!this.keys)
		{
			this.keys = [];
		}
	
		this.initDeleteKey();		
		if(this.getSelectionModel().getSelected) {
			this.initNav();
		}
		
		this.initScrollOffset();
		
		this.initHeaderMenu();
	},
	
	initHeaderMenu : function() {
		this.enableHdMenu = false;
		this.on('render',function() {			
			// header menu
			this.addClass("go-grid");
			this.headerBtnWrap = this.el.child(".x-grid3-header");
			if (this.headerBtnWrap) {// && this.enableHdMenu) {
				this.headerBtn = new Ext.Component({
					cls: "go-grid-hd-btn",
					renderTo: this.headerBtnWrap
				});
				this.headerBtn.el.on("click", this.onHeaderBtnClick, this);
			}
		}, this);
	},
	
	//Always enforce room for scrollbar so last column in resizable because of our custom header button.
	initScrollOffset : function() {
		
		if(this.autoHeight || this.getView().scrollOffset === 0) {
			return;
		}
		
		this.getView().scrollOffset = dp(24);
		this.getView().refresh = function(headersToo) {
			this.fireEvent('beforerefresh', this);
			this.grid.stopEditing(true);

			var result = this.renderBody();
			this.mainBody.update(result).setWidth(this.getOffsetWidth());
			if (headersToo === true) {
				 this.updateHeaders();
				 this.updateHeaderSortState();
			}
			this.processRows(0, true);
			this.layout();
			this.applyEmptyText();
			this.fireEvent('refresh', this);
		};
		this.getView().updateHeaderWidth = function(updateMain) {
			var innerHdChild = this.innerHd.firstChild,
				 totalWidth   = this.getTotalWidth();

			innerHdChild.style.width = this.getOffsetWidth();
			innerHdChild.firstChild.style.width = totalWidth;

			if (updateMain !== false) {
				 this.mainBody.dom.style.width = this.getOffsetWidth();
			}
		};
		
	},
	
	initCustomFields : function() {
		if(!this.columns || !this.store || !this.store.entityStore || !this.store.entityStore.entity.customFields) {
			return;
		}		
		
		this.columns = this.columns.concat(go.customfields.CustomFields.getColumns(this.store.entityStore.entity.name))
	},
	
	//The navigate can be used in modules to track row selections for navigation.
	//It buffers keyboard actions and it doesn't fire when ctrl or shift is used for multiselection
	initNav : function() {
		this.addEvents({navigate: true});
		this.on('rowclick', function(grid, rowIndex, e){			

			if(!e.ctrlKey && !e.shiftKey)
			{
				var record = this.getSelectionModel().getSelected();
				if(record) {
					this.fireEvent('navigate', this, rowIndex, record);				
				}
			}
			
		}, this);
		
		
		this.on("keydown",function(e) {
			if(!e.ctrlKey && !e.shiftKey)
			{
				var record = this.getSelectionModel().getSelected();
				if(record) {
					this.fireEvent('navigate', this, this.store.indexOf(record), record);				
				}
			}			
		}, this, {
			buffer: 100
		});
	},
	
	initDeleteKey : function() {
		this.keys.push({
			key: Ext.EventObject.DELETE,
			fn: function (key, e) {
				// sometimes there's a search input in the grid, so dont delete when focus is on an input
				if(e.target.tagName!='INPUT') {
					this.deleteSelected();
				}
			},
			scope: this
		});
	},

	deleteSelected: function () {

		var selectedRecords = this.getSelectionModel().getSelections(), count = selectedRecords.length, strConfirm;

		switch (count)
		{
			case 0:
				return;
			case 1:
				strConfirm = t("Are you sure you want to delete the selected item?");
				break;

			default:
				strConfirm = t("Are you sure you want to delete the {count} items?").replace('{count}', count);
				break;
		}

		Ext.MessageBox.confirm(t("Confirm delete"), t(strConfirm), function (btn) {

			if (btn != "yes") {
				return;
			}
			
			this.doDelete(selectedRecords);
			
		}, this);
	},
	
	doDelete : function(selectedRecords) {
		this.getStore().entityStore.set({
			destroy:  selectedRecords.column("id")
		});
	},
	
	handleHdMenuItemClick: function(item) {
		var cm = this.getColumnModel()
		  , id = item.getItemId()
		  , column = cm.getIndexById(id.substr(4));
		if (column !== -1) {
			if (item.checked && cm.getColumnsBy(function(c) {return !c.hidden }, this).length <= 1) {
				 return
			}
			cm.setHidden(column, item.checked)
		}
	},
	onHeaderBtnClick: function(event, el, object) {
		var i, cm = this.getColumnModel(), column, item;
		if (!this.headerMenu) {
			this.headerMenu = new Ext.menu.Menu({
				 items: []
			});
			this.headerMenu.on("itemclick", this.handleHdMenuItemClick, this);
		}
		this.headerMenu.removeAll();
		for (i = 0; i < cm.getColumnCount(); i++) {
			column = cm.getColumnAt(i);
			if (column.hideable !== false) {
				item = new Ext.menu.CheckItem({
					 text: cm.getOrgColumnHeader(i),
					 itemId: "col-" + cm.getColumnId(i),
					 checked: !cm.isHidden(i),
					 hideOnClick: false,
					 htmlEncode: column.headerHtmlEncode
				});
				this.headerMenu.add(item)
			}
		}
		this.headerMenu.show(el, "tr-br?")
	}
}
