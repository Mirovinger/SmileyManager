<?php

class Milano_SmileyManager_DataWriter_Category extends XenForo_DataWriter
{
    const OPTION_MOVE_SMILIE_CATEGORY_ID = 'moveSmilieCategoryId';

    protected function _getFields()
    {
        return array(
            'smilie_category' => array(
                'smilie_category_id'   	=> array('type' => self::TYPE_UINT, 'autoIncrement' => true),
                'category_title'       	=> array('type' => self::TYPE_STRING, 'required' => true, 'maxLength' => 100,
					'requiredError' => 'please_enter_valid_title'
				),
                'display_order'        	=> array('type' => self::TYPE_UINT, 'default' => 1),
                'smilie_count'        	=> array('type' => self::TYPE_UINT, 'default' => 0),
                'active'        		=> array('type' => self::TYPE_BOOLEAN, 'default' => 0)
            )
        );
    }

    protected function _getExistingData($data)
    {
        if (!$id = $this->_getExistingPrimaryKey($data, 'smilie_category_id'))
        {
            return false;
        }

        return array(
            'smilie_category' => $this->_getCategoryModel()->getCategoryById($id)
        );
    }

    protected function _getUpdateCondition($tableName)
    {
        return 'smilie_category_id = ' . $this->_db->quote($this->getExisting('smilie_category_id'));
    }

    protected function _getDefaultOptions()
    {
        return array(
            self::OPTION_MOVE_SMILIE_CATEGORY_ID => null
        );
    }

    protected function _postSave()
    {
        $this->_getSmilieModel()->rebuildSmilieCache();
        $this->_getCategoryModel()->rebuildCategories();
    }

    protected function _postDelete()
    {
        $smilieModel = $this->_getSmilieModel();

        $categoryId = $this->getOption(self::OPTION_MOVE_SMILIE_CATEGORY_ID);
        if (isset($categoryId))
        {
        	$moveSmilies = $smilieModel->getSmilies(array('smilie_category_id' => $this->getExisting('smilie_category_id')));
            $smilieModel->updateSmiliesToCategory($moveSmilies, $categoryId);
            $smilieModel->deleteSmiliesInCategory($this->getExisting('smilie_category_id'));
        }
        else
        {
            $smilieModel->deleteSmiliesInCategory($this->getExisting('smilie_category_id'));
        }

        $this->_getSmilieModel()->rebuildSmilieCache();
        $this->_getCategoryModel()->rebuildCategories();
    }

    protected function _getCategoryModel()
    {
        return $this->getModelFromCache('Milano_SmileyManager_Model_Category');
    }

    protected function _getSmilieModel()
    {
        return $this->getModelFromCache('XenForo_Model_Smilie');
    }
}