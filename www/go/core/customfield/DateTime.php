<?php

namespace go\core\customfield;

use GO;
use go\core\db\Criteria;
use go\core\orm\Entity;
use go\core\orm\Filters;
use go\core\orm\Query;
use go\core\util;

class DateTime extends Base {

	/**
	 * Get column definition for SQL
	 * 
	 * @return string
	 */
	protected function getFieldSQL() {
		$d = $this->field->getDefault();
		$d = isset($d) && $d != "" ? GO()->getDbConnection()->getPDO()->quote((new util\DateTime($d))->format('Y-m-d H:i')) : "NULL";
		return "DATETIME DEFAULT " . $d;
	}
	
	/**
	 * Defines an entity filter for this field.
	 * 
	 * @see Entity::defineFilters()
	 * @param Filters $filter
	 */
	public function defineFilter(Filters $filters) {		
		
		$filters->addDate($this->field->databaseName, function(Criteria $criteria, $comparator, $value, Query $query, array $filter){
			$this->joinCustomFieldsTable($query);						
			$criteria->where('customFields.' . $this->field->databaseName, $comparator, $value);
		});
	}
}