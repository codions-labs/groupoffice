/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id$
 * @copyright Copyright Intermesh
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
go.systemsettings.Dialog = Ext.extend(go.Window, {
	
	modal:true,
	resizable:true,
	maximizable:true,
	iconCls: 'ic-settings',
	title: t("System settings"),
	currentUser:null,

	initComponent: function () {
		
		this.saveButton = new Ext.Button({
			text: t('Save'),
			handler: this.submit,
			scope:this
		});
				

		
		this.tabPanel = new Ext.TabPanel({
			headerCfg: {cls:'x-hide-display'},
			items: []
		});
		
		this.add(this.tabPanel);
		
		
		this.tabStore = new Ext.data.ArrayStore({
			fields: ['name', 'icon', 'visible'],
			data: []
		});
		
		this.selectMenu = new Ext.Panel({
			region:'west',
			cls: 'go-sidenav',
			layout:'fit',
			width:dp(220),
			items:[this.selectView = new Ext.DataView({
				xtype: 'dataview',
				cls: 'go-nav',
				store:this.tabStore,
				singleSelect: true,
				overClass:'x-view-over',
				itemSelector:'div',
				tpl:'<tpl for=".">\
					<div><i class="icon {icon}"></i>\
					<span>{name}</span></div>\
				</tpl>',
				columns: [{dataIndex:'name'}],
				listeners: {
					selectionchange: function(view, nodes) {					
						this.tabPanel.setActiveTab(nodes[0].viewIndex);
					},
					scope:this
				}
			})]
		});
		
		Ext.apply(this,{
			width:dp(1000),
			height:dp(800),
			layout:'border',
			closeAction:'hide',
			items: [
				this.selectMenu,
				this.tabPanel
			],
			buttons:[
				this.saveButton
			]
		});
		
		this.addEvents({
			'loadStart' : true,
			'loadComplete' : true,
			'submitStart' : true,
			'submitComplete' : true
		});
		
		go.systemsettings.Dialog.superclass.initComponent.call(this);
	},
	
	show: function(userId){
		go.systemsettings.Dialog.superclass.show.call(this);
		this.selectView.select(this.tabStore.getAt(0));
		this.load();
	},

	submit : function(){
		this.actionStart();
		this.fireEvent('submitStart',this);
		
		// loop through child panels and call onSubmitStart function if available
		this.tabPanel.items.each(function(tab) {
			
			tab.submit(this.onSubmitComplete, this);
			
		},this);

		
	},
	
	onSubmitComplete : function() {
		
	},
	
	/**
	 * Add a panel to the tabpanel of this dialog
	 * 
	 * @param string panelID
	 * @param string panelClass
	 * @param object panelConfig
	 * @param int position
	 * @param boolean passwordProtected
	 */
	addPanel : function(panelID, panelClass, position, passwordProtected){
		var cfg = {
			header: false,
			loaded:false,
			submitted:false
		};
		Ext.apply(cfg,{
			id:panelID,
			passwordProtected:passwordProtected
		});
		
		var pnl = new panelClass(cfg);
		
			var menuRec = new Ext.data.Record({
			'name':pnl.title,
			'icon':pnl.iconCls,
			'visible':true
		});
		
		if(Ext.isEmpty(position)){
			this.tabPanel.add(pnl);
			this.tabStore.add(menuRec);
		}else{
			this.tabPanel.insert(position,pnl);
			this.tabStore.insert(position,menuRec);
		}
	}

});

go.systemsettingsDialog = new go.systemsettings.Dialog();