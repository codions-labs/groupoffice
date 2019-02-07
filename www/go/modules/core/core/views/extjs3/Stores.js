go.modules.core.core.cronStore = new GO.data.JsonStore({
	url: GO.url('core/cron/store'),		
	root: 'results',
	id: 'id',
	totalProperty:'total',
	fields: ['id','name','active','minutes', 'hours','error', 'monthdays', 'months', 'weekdays','years','job','nextrun','lastrun','completedat'],
	remoteSort: true,
	model:"GO\\Base\\Cron\\CronJob"
});
	
go.modules.core.core.periodStore = new GO.data.JsonStore({
	url: GO.url('core/cron/runBetween'),		
	root: 'results',
	id: 'id',
	totalProperty:'total',
	fields: ['id','name','active','minutes', 'hours', 'monthdays', 'months', 'weekdays','years','job','nextrun','lastrun','completedat'],
	remoteSort: true,
	model:"GO\\Base\\Cron\\CronJob"
});
	
go.modules.core.core.jobStore = new GO.data.JsonStore({
	url: GO.url('core/cron/availableCronCollection'),		
	root: 'results',
	id: 'class',
	totalProperty:'total',
	fields: ['name','class','selection'],
	remoteSort: true
});
