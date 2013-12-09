<?php

class Milano_SmileyManager_Model_Smilie extends XFCP_Milano_SmileyManager_Model_Smilie
{
	const FETCH_CATEGORY    	= 0x1;

    public function getSmilies(array $conditions = array(), array $fetchOptions = array())
	{
		$whereClause = $this->prepareSmilieConditions($conditions, $fetchOptions);

		$orderClause = $this->prepareSmilieOrderOptions($fetchOptions, 'smilie.smilie_display_order, smilie.title');
		$joinOptions = $this->prepareSmilieFetchOptions($fetchOptions);
		$limitOptions = $this->prepareLimitFetchOptions($fetchOptions);

		return $this->fetchAllKeyed($this->limitQueryResults(
			'
				SELECT smilie.*
					' . $joinOptions['selectFields'] . '
				FROM xf_smilie AS smilie
				' . $joinOptions['joinTables'] . '
				WHERE ' . $whereClause . '
				' . $orderClause . '
			', $limitOptions['limit'], $limitOptions['offset']
		), 'smilie_id');
	}

	public function countSmilies(array $conditions = array())
	{
		$fetchOptions = array();

		$whereClause = $this->prepareSmilieConditions($conditions, $fetchOptions);
		$joinOptions = $this->prepareSmilieFetchOptions($fetchOptions);

		return $this->_getDb()->fetchOne('
			SELECT COUNT(*)
			FROM xf_smilie AS smilie
			' . $joinOptions['joinTables'] . '
			WHERE ' . $whereClause
		);
	}

    public function groupedSmiliesByCategory(array $smilies = array())
    {
        $output = array();

        if (!$smilies)
        {
            $smilies = $this->getSmilies(array(), array(
            	'join' => self::FETCH_CATEGORY,
            	'order' => 'display_order'
            ));
        }

        foreach ($smilies as $smilie)
        {
        	if (!$smilie['smilie_category_id'])
        	{
        		$uncategorized = new XenForo_Phrase('SmileyManager_uncategorized');

        		$smilie['smilie_category_id'] = 0;
        		$smilie['category_title'] = $uncategorized->render(false);
        		$smilie['active'] = 1;
        	}
            $output[$smilie['smilie_category_id']][$smilie['smilie_id']] = $smilie;
        }

        return $output;
    }

    public function getEditorSmilies(array $smilies = array())
    {
        if (!$smilies)
        {
            if (XenForo_Application::getSimpleCacheData('groupedSmilies'))
            {
            	$smilies = XenForo_Application::getSimpleCacheData('groupedSmilies');
            }
            else
            {
                $smilies = $this->rebuildGroupedSmilieCache();
            }
        }

        return $smilies;
    }

    public function getGroupedSmiliesForCache()
    {
    	$uncategorizedSmilies = $this->getSmilies(
			array(
				'smilie_category_id' => 0
			),
			array(
				'join' => self::FETCH_CATEGORY,
				'order' => 'display_order'
			)
		);

		$smilies = $uncategorizedSmilies += $this->getSmilies(
			array(
				'active' => 1
			),
			array(
				'join' => self::FETCH_CATEGORY,
				'order' => 'display_order'
			)
		);

        $smilies = $this->groupedSmiliesByCategory($smilies);
        $smilies = $this->prepareGroupedSmiliesForEditor($smilies);

        return $smilies;
    }

    public function prepareSmilieConditions(array $conditions, array &$fetchOptions)
	{
		$db = $this->_getDb();
		$sqlConditions = array();

		if (isset($conditions['smilie_category_id']))
		{
			if (is_array($conditions['smilie_category_id']))
			{
				$sqlConditions[] = 'smilie.smilie_category_id IN (' . $db->quote($conditions['smilie_category_id']) . ')';
			}
			else
			{
				$sqlConditions[] = 'smilie.smilie_category_id = ' . $db->quote($conditions['smilie_category_id']);
			}
		}

		if (isset($conditions['smilie_category_id_not']))
		{
			if (is_array($conditions['smilie_category_id_not']))
			{
				$sqlConditions[] = 'smilie.smilie_category_id NOT IN (' . $db->quote($conditions['smilie_category_id_not']) . ')';
			}
			else
			{
				$sqlConditions[] = 'smilie.smilie_category_id <> ' . $db->quote($conditions['smilie_category_id_not']);
			}
		}

		if (!empty($conditions['smilie_id_not']))
		{
			$sqlConditions[] = 'smilie.smilie_id <> ' . $db->quote($conditions['smilie_id']);
		}

		if (isset($conditions['sprite_mode']))
		{
			$sqlConditions[] = 'smilie.sprite_mode = ' . ($conditions['sprite_mode'] ? 1 : 0);
		}

		if (isset($fetchOptions['join']))
		{
			if (isset($conditions['active']))
			{
				$sqlConditions[] = 'category.active = ' . ($conditions['active'] ? 1 : 0);
			}
		}

		return $this->getConditionsForClause($sqlConditions);
	}

	public function prepareSmilieOrderOptions(array &$fetchOptions, $defaultOrderSql = '') 
	{
		$choices = array(
			'display_order' => 'category.display_order, category.category_title, smilie.smilie_display_order, smilie.title', 
			'category_display_order' => 'category.display_order, category.category_title',
			'title' => 'smilie.title',
			'text' => 'smilie.smilie_text'
		); 
		return $this->getOrderByClause($choices, $fetchOptions, $defaultOrderSql); 
	}
	
	public function prepareSmilieFetchOptions(array $fetchOptions)
	{
		$selectFields = '';
		$joinTables = '';

		if (!empty($fetchOptions['join']))
		{
			if ($fetchOptions['join'] & self::FETCH_CATEGORY)
			{
				$selectFields .= ',
					category.*';
				$joinTables .= '
					LEFT JOIN smilie_category AS category ON
						(category.smilie_category_id = smilie.smilie_category_id)';
			}
		}

		return array(
			'selectFields' => $selectFields,
			'joinTables'   => $joinTables
		);
	}

    public function rebuildGroupedSmilieCache()
    {
        $smilies = $this->getGroupedSmiliesForCache();
        XenForo_Application::setSimpleCacheData('groupedSmilies', $smilies);

        return $smilies;
    }

    public function rebuildSmilieCache()
    {
        parent::rebuildSmilieCache();

        $this->rebuildGroupedSmilieCache();
    }

    public function createSmilies(array $smilies)
    {
    	$db = $this->_getDb();
    	XenForo_Db::beginTransaction($db);

    	foreach ($smilies as $smilie)
        {
        	if (is_array($smilie))
        	{
        		if (!$this->getSmiliesByText($smilie['smilie_text']))
        		{
        			$smilie = array_merge(array(
        				'sprite_mode' => 0,
        				'sprite_params' => array()
        			), $smilie);
	        		$dw = XenForo_DataWriter::create('XenForo_DataWriter_Smilie');
	        		$dw->setOption(Milano_SmileyManager_DataWriter_Smilie::OPTION_REBUILD_CATEGORY_CACHE, false);
	            	$dw->bulkSet($smilie);

	            	$dw->save();
	            }
        	}
        }

    	XenForo_Db::commit($db);

    	$this->_getCategoryModel()->rebuildCategories();
    }

    public function updateSmiliesToCategory(array $smilies, $categoryId)
    {
    	$db = $this->_getDb();
    	XenForo_Db::beginTransaction($db);

        foreach ($smilies as $smilie)
        {
        	$dw = XenForo_DataWriter::create('XenForo_DataWriter_Smilie', XenForo_DataWriter::ERROR_SILENT);
        	$dw->setOption(Milano_SmileyManager_DataWriter_Smilie::OPTION_REBUILD_CATEGORY_CACHE, false);
            $dw->setExistingData($smilie);
            $dw->set('smilie_category_id', $categoryId);

            $dw->save();
        }

        XenForo_Db::commit($db);

        $this->_getCategoryModel()->rebuildCategories();
        $this->_getCategoryModel()->updateSmilieCount($categoryId);
    }

    public function deleteSmiliesInCategory($categoryId)
    {
        return $this->_getDb()->query("
            DELETE FROM xf_smilie
            WHERE smilie_category_id = ?
        ", array($categoryId));
    }

    public function prepareGroupedSmiliesForList($smilies)
    {
        foreach ($smilies as $categoryId => $categorySmilies)
        {
            $smilies[$categoryId] = parent::prepareSmiliesForList($categorySmilies);
        }

        return $smilies;
    }

    public function prepareGroupedSmiliesForEditor(array $smilies)
    {
        foreach ($smilies as $categoryId => &$categorySmilies)
        {
            foreach ($categorySmilies as &$smilie)
            {
                $smilie = $this->prepareSmilie($smilie, true);
                $smilie['smilieText'] = preg_split('/\r?\n/', $smilie['smilie_text'], -1, PREG_SPLIT_NO_EMPTY);

				if (!$smilie['sprite_mode'] || !$smilie['sprite_params'])
				{
					unset($smilie['sprite_params']);
				}

				unset($smilie['sprite_mode'], $smilie['smilie_text']);
            }
        }

        return $smilies;
    }

    public function importSmileyXmlFromFile($fileName, $categoryId = false)
	{
		if (!file_exists($fileName) || !is_readable($fileName))
		{
			throw new XenForo_Exception(new XenForo_Phrase('please_enter_valid_file_name_requested_file_not_read'), true);
		}

		try
		{
			$document = new SimpleXMLElement($fileName, 0, true);
		}
		catch (Exception $e)
		{
			throw new XenForo_Exception(
				new XenForo_Phrase('provided_file_was_not_valid_xml_file'), true
			);
		}

		return $this->importSmileyXml($document, $categoryId);
	}

	public function importSmileyXml(SimpleXMLElement $xml, $categoryId = false)
	{
		if ($xml->getName() != 'category')
		{
			throw new XenForo_Exception(new XenForo_Phrase('SmileyManager_provided_file_is_not_an_smilie_xml_file'), true);
		}

		$categoryData = array(
			'category_title' => (string)$xml['category_title'],
			'display_order' => (int)$xml['display_order'],
			'smilie_count' => (int)$xml['smilie_count'],
			'active' => (int)$xml['active']
		);

		if (!$categoryId)
		{
			$categoryDw = XenForo_DataWriter::create('Milano_SmileyManager_DataWriter_Category');
			$categoryDw->bulkSet($categoryData);
			$categoryDw->save();
			$category = $categoryDw->getMergedData();
		}

		$smilies = XenForo_Helper_DevelopmentXml::fixPhpBug50670($xml->smilies->smilie);
		if (!empty($smilies))
		{
			foreach ($smilies as &$smilie) 
			{
				$spriteParams = array(
					'h'=>(int)$smilie['h'],
					'w'=>(int)$smilie['w'],
					'x'=>(string)$smilie['x'],
					'y'=>(string)$smilie['y']
				);

				$smilie = array(
					'title' => XenForo_Helper_DevelopmentXml::processSimpleXmlCdata($smilie->title),
					'image_url' => XenForo_Helper_DevelopmentXml::processSimpleXmlCdata($smilie->image_url),
					'smilie_text' => XenForo_Helper_DevelopmentXml::processSimpleXmlCdata($smilie->smilie_text),
					'sprite_mode' => (int)$smilie['sprite_mode'],
					'sprite_params' => $spriteParams,
					'smilie_display_order' => (int)$smilie['display_order']
				);

				if (isset($category))
				{
					$smilie['smilie_category_id'] = $category['smilie_category_id'];
				}
				else
				{
					$smilie['smilie_category_id'] = $categoryId;
				}
			}

			$this->createSmilies($smilies);
		}

		$this->rebuildSmilieCache();

		return true;
	}

    public function getSmileyXml(array $category, array $smilies)
	{
		$document = new DOMDocument('1.0', 'utf-8');
		$document->formatOutput = true;

		$rootNode = $document->createElement('category');
		$rootNode->setAttribute('category_title', $category['category_title']);
		$rootNode->setAttribute('display_order', $category['display_order']);
		$rootNode->setAttribute('smilie_count', $category['smilie_count']);
		$rootNode->setAttribute('active', $category['active']);
		$document->appendChild($rootNode);

		$dataNode = $rootNode->appendChild($document->createElement('smilies'));
		$this->appendSmileyXml($dataNode, $smilies);

		return $document;
	}

	public function appendSmileyXml(DOMElement $rootNode, array $smilies)
	{
		$document = $rootNode->ownerDocument;

		foreach ($smilies as $smilie) 
		{
			$smilieNode = $document->createElement('smilie');

			if ($smilie['sprite_params']) 
			{
				$spriteParams = unserialize($smilie['sprite_params']);
			} 
			else 
			{
				$spriteParams = array('w'=>'','h'=>'','x'=>'','y'=>'');
			}

			$smilieNode->setAttribute('y', $spriteParams['y']);
			$smilieNode->setAttribute('x', $spriteParams['x']);
			$smilieNode->setAttribute('h', $spriteParams['h']);
			$smilieNode->setAttribute('w', $spriteParams['w']);
			$smilieNode->setAttribute('sprite_mode', $smilie['sprite_mode']);
			$smilieNode->setAttribute('display_order', $smilie['smilie_display_order']);

			$titleNode = $document->createElement('title');
			$titleNode->appendChild(XenForo_Helper_DevelopmentXml::createDomCdataSection($document, $smilie['title']));
			$smilieNode->appendChild($titleNode);

			$imageNode = $document->createElement('image_url');
			$imageNode->appendChild(XenForo_Helper_DevelopmentXml::createDomCdataSection($document, $smilie['image_url']));
			$smilieNode->appendChild($imageNode);

			$smilieTextNode = $document->createElement('smilie_text');
			$smilieTextNode->appendChild(XenForo_Helper_DevelopmentXml::createDomCdataSection($document, $smilie['smilie_text']));
			$smilieNode->appendChild($smilieTextNode);

			$rootNode->appendChild($smilieNode);
		}
	}

	public function getImagesFromDirectory($directory)
	{
		return Milano_Common_File::getFilesFromDirectory($directory, array('jpg', 'png', 'gif', 'jpeg'));
	}

    protected function _getCategoryModel()
    {
        return $this->getModelFromCache('Milano_SmileyManager_Model_Category');
    }
}
