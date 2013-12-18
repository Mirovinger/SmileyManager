<?php

class Milano_SmileyManager_DataWriter_Smilie extends XFCP_Milano_SmileyManager_DataWriter_Smilie
{
	const OPTION_REBUILD_CATEGORY_CACHE = 'rebuildCategoryCache';
	const OPTION_REBUILD_DISPLAY_ORDER = 'rebuildDisplayOrder';

	protected function _getFields() 
	{
		$fields = parent::_getFields();
		
		$fields['xf_smilie']['smilie_category_id'] = array(
			'type' => self::TYPE_UINT,
			'default' => 0
		);
		$fields['xf_smilie']['smilie_display_order'] = array(
			'type' => self::TYPE_UINT,
			'default' => 0
		);
		
		return $fields;
	}

	protected function _getDefaultOptions()
    {
        return array(
            self::OPTION_REBUILD_CATEGORY_CACHE => true,
            self::OPTION_REBUILD_DISPLAY_ORDER => false
        );
    }

	protected function _preSave() 
	{		
		if (isset($GLOBALS['Milano_SmileyManager_ControllerAdmin_Smilie'])) 
		{
			$GLOBALS['Milano_SmileyManager_ControllerAdmin_Smilie']->SmileyManager_actionSave($this);
		}

		return parent::_preSave();
	}

	protected function _postSave()
	{
		parent::_postSave();

		if ($this->isInsert() || $this->isChanged('smilie_category_id'))
		{
			$this->_getCategoryModel()->updateSmilieCount($this->get('smilie_category_id'), 1);
			$this->_getCategoryModel()->updateSmilieCount($this->getExisting('smilie_category_id'), -1);
		}

		if ($this->getOption(self::OPTION_REBUILD_CATEGORY_CACHE))
		{
			$this->_getCategoryModel()->rebuildCategories();
		}

		if ($this->getOption(self::OPTION_REBUILD_DISPLAY_ORDER))
		{
			if ($this->isChanged('smilie_display_order'))
			{
				if ($this->getExisting('smilie_display_order') < $this->get('smilie_display_order'))
				{
					$this->_db->query('
						UPDATE xf_smilie 
						SET smilie_display_order = smilie_display_order - 1 
						WHERE smilie_category_id = ' . $this->get('smilie_category_id') . ' 
							AND smilie_id <> ' . $this->get('smilie_id') . ' 
							AND smilie_display_order > ' . $this->getExisting('smilie_display_order') . ' 
							AND smilie_display_order <= ' . $this->get('smilie_display_order'));
				}
				else
				{
					$this->_db->query('
						UPDATE xf_smilie 
						SET smilie_display_order = smilie_display_order + 1 
						WHERE smilie_category_id = ' . $this->get('smilie_category_id') . ' 
							AND smilie_id <> ' . $this->get('smilie_id') . ' 
							AND smilie_display_order < ' . $this->getExisting('smilie_display_order') . ' 
							AND smilie_display_order >= ' . $this->get('smilie_display_order'));
				}
			}
		}
	}

	protected function _postDelete()
	{
		parent::_postDelete();

		$this->_getCategoryModel()->updateSmilieCount($this->get('smilie_category_id'), -1);
		$this->_getCategoryModel()->rebuildCategories();
	}

	protected function _getCategoryModel()
    {
        return $this->getModelFromCache('Milano_SmileyManager_Model_Category');
    }
}