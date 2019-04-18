/* global Ext, go */


go.links.DetailPanel = Ext.extend(Ext.Panel, {
	cls: 'go-links-detail',
	limit: 5,
	initComponent: function () {
		var store = this.store = new go.data.Store({
			baseParams: {
				limit: this.limit,
				position: 0,
				calculateTotal:true,
				filter: {
					entities: [{name: this.link.entity, filter: this.link.filter}]
				}
			},
			fields: [
				'id', 
				{name: "to", type: "relation"}, 
				'toId', 
				'toSearchId',
				{name: 'createdAt', type: 'date'}, 
				'toEntity'
			],
			entityStore: "Link",
			listeners: {
				datachanged: function () {
					this.setVisible(this.store.getCount() > 0);
				},
				scope: this
			}
		});
		
		
		var tpl = new Ext.XTemplate('<div class="icons"><tpl for=".">\
				<p data-id="{id}">\
				<tpl if="xindex === 1">\
					<i class="label ' + this.link.iconCls + '" ext:qtip="{toEntity}"></i>\
				</tpl>\
				<tpl for="to">\
				<a>{name}</a>\
				<label>{[GO.util.dateFormat(parent.createdAt)]}<br />{description}</label>\
				<a class="right show-on-hover"><i class="icon">delete</i></a>\
				</tpl>\
			</p>\
		</tpl>\
		{[this.printMore(values)]}\
		</div>', {			
			
			printMore : function(values) {
				if(store.getCount() < store.getTotalCount()) {
					return "<a class=\"show-more\">" + t("Show more...") + "</a>";
				} else
				{
					return "";
				}
			}
		});
		
		
		Ext.apply(this, {
			listeners: {
				added: function(me, dv, index) {
					this.stateId = 'go-links-' + (dv.entity ? dv.entity : dv.entityStore.entity.name);
				},
				scope: this
			},
//			header: false,
			collapsible: true,
			titleCollapse: true,
			title: this.link.title,
			items: this.dataView = new Ext.DataView({
				store: this.store,
				tpl: tpl,
				autoHeight: true,
				multiSelect: true,
				itemSelector: 'p',
				listeners: {
					scope: this,
					containerclick: function(dv, e) {
		
						if(e.target.classList.contains("show-more")) {
							this.store.baseParams.position += this.limit;
							this.store.load({
								add: true,
								callback: function() {
									this.dataView.refresh();
								},
								scope: this
							});
						}
					},
					click: function (dv, index, node, e) {
						
						
						var record = this.store.getAt(index);
						
						if(e.target.tagName === "I" && e.target.innerHTML === 'delete') {							
							//this.delete(record);
							
							go.Db.store("Link").set({
								destroy: [record.id]
							});
						} else 
						{
							var record = this.store.getById(node.getAttribute('data-id'));
							
							var entity = go.Entities.get(record.data.toEntity);
							if (!entity) {
								throw record.data.toEntity + " is not a registered entity";
							}
//							entity.goto(record.data.toId);
							
							var previewPanel = entity.links[0].linkDetail(), win = new go.Window({
								tools: [{
									id: 'home',
									handler: function() {
										entity.goto(record.data.toId);
										win.close();
									}
								}],
								title: entity.title,
								layout: "fit",
								width: previewPanel.width || dp("600"),
								height: previewPanel.height || dp("700"),
								items: [
									previewPanel
								]
							});
							
							win.show();
							previewPanel.load(record.data.toId);

//								var lb = new go.links.LinkBrowser({
//									entity: this.store.baseParams.filter.entity,
//									entityId: this.store.baseParams.filter.entityId
//								});
//
//								lb.show();
//								lb.load(record.data.toEntity, record.data.toId);
						}
					}
				}
			})

		});
		
		go.links.DetailPanel.superclass.initComponent.call(this);
	},
	
	onLoad: function (dv) {
		
		this.detailView = dv;	
		
		this.hide();
		
		this.store.baseParams.filter.entity = dv.entity ? dv.entity : dv.entityStore.entity.name, //dv.entity exists on old DetailView or display panels
		this.store.baseParams.filter.entityId = dv.model_id ? dv.model_id : dv.currentId; //model_id is from old display panel
		this.store.baseParams.position = 0;
		this.store.load();
	}
});

go.links.getDetailPanels = function() {
	
	var panels = [];
	
	go.Entities.getLinkConfigs().forEach(function (e) {		
		panels.push(new go.links.DetailPanel({
			link: e
		}));
	});
	
	return panels;
};
