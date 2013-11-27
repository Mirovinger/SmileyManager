<?php

class Milano_SmileyManager_Model_Category extends XenForo_Model
{
	public function getCategoryById($categoryId)
	{
		return $this->_getDb()->fetchRow('
			SELECT *
			FROM smilie_category
			WHERE smilie_category_id = ?
		', $categoryId);
	}

	public function getCategoriesByIds(array $categoryIds)
	{
		if (!$categoryIds)
		{
			return array();
		}

		return $this->fetchAllKeyed('
			SELECT *
			FROM smilie_category
			WHERE smilie_category_id IN (' . $this->_getDb()->quote($categoryIds) . ')
		', 'smilie_category_id');
	}

	public function getAllCategories()
	{
		return $this->fetchAllKeyed('
			SELECT *
			FROM smilie_category
			ORDER BY display_order, category_title
		', 'smilie_category_id');
	}

	public function getActiveCategories()
	{
		return $this->fetchAllKeyed('
			SELECT *
			FROM smilie_category
			WHERE active = 1
				AND smilie_count > 0
			ORDER BY display_order, category_title
		', 'smilie_category_id');
	}

	public function getCategories($active = true)
	{
		$categories = $this->_getUncategorized();

		if ($active)
		{
			if ($categories[0]['active'])
			{
				$categories += $this->getActiveCategories();
			}
			else
			{
				$categories = $this->getActiveCategories();
			}
		}
		else
		{
			$categories += $this->getAllCategories();
		}

		return $categories;
	}

	public function getCategoriesForCache()
	{
		if ($categories = XenForo_Application::getSimpleCacheData('smilieCategories'))
		{
			return $categories;
		}

		return $this->rebuildCategories();
	}

	public function getCategoryOptions($selectedCategoryId = 0)
    {
        $categories = $this->getAllCategories();

        $options = array();

        foreach ($categories as $category)
        {
        	if ($category['smilie_category_id'] !== $selectedCategoryId)
        	{
	            $options[] = array(
	                'label' => $category['category_title'],
	                'value' => $category['smilie_category_id']
	            );
	        }
        }

        return $options;
    }

	public function prepareCategory(array $category)
	{
		$category['category_title'] = XenForo_Helper_String::censorString($category['category_title']);

		return $category;
	}

	public function prepareCategories(array $categories)
	{
		foreach ($categories AS &$category)
		{
			$category = $this->prepareCategory($category);
		}

		return $categories;
	}

	public function updateSmilieCount($categoryId, $adjust = null)
	{
		if (!$categoryId)
		{
			return false;
		}

		$db = $this->_getDb();
		XenForo_Db::beginTransaction($db);

		if ($adjust === null)
		{
			$smilieCount = $db->fetchOne('
				SELECT COUNT(*)
				FROM xf_smilie
				WHERE smilie_category_id = ?
			', $categoryId);

			$db->query('
				UPDATE smilie_category
				SET smilie_count = ?
				WHERE smilie_category_id = ?
			', array($smilieCount, $categoryId));
		}
		else
		{
			$db->query('
				UPDATE smilie_category
				SET smilie_count = smilie_count + ' . $adjust . '
				WHERE smilie_category_id = ?
			', $categoryId);
		}

		XenForo_Db::commit($db);
	}

	public function rebuildCategories()
	{
        $categories = $this->getCategories();

        XenForo_Application::setSimpleCacheData('smilieCategories', $categories);

        return $categories;
	}

	protected function _getUncategorized()
	{
		$uncategorized = new XenForo_Phrase('SmileyManager_uncategorized');
		$smilieCount = $this->getModelFromCache('XenForo_Model_Smilie')->countSmilies(array('smilie_category_id' => 0));

		return array(
            0 => array(
                'smilie_category_id' => 0,
                'category_title' => $uncategorized->render(),
                'smilie_count' => $smilieCount,
                'active' => !empty($smilieCount) ? 1 : 0
            )
        );
	}
}