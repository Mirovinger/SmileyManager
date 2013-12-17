// intro
var spriteCow = {};

// MicroEvent
spriteCow.MicroEvent = function(){};
spriteCow.MicroEvent.prototype = {
	bind: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event] || [];
		this._events[event].push(fct);
	},
	unbind: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false ) { return; }
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	trigger: function(event /* , args... */) {
		var eventName,
			args;

		if (event instanceof $.Event) {
			eventName = event.type;
			args = Array.prototype.slice.call(arguments, 0);
		}
		else {
			eventName = event;
			args = Array.prototype.slice.call(arguments, 1);
		}
		this._events = this._events || {};

		if ( eventName in this._events === false  ) { return event; }

		for (var i = 0, len = this._events[eventName].length; i < len; i++) {
			this._events[eventName][i].apply( this, args );
		}

		return event;
	}
};

// Rect
spriteCow.Rect = (function() {
	function Rect(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	var RectProto = Rect.prototype;
	
	return Rect;
})();

// ImgInput
spriteCow.ImgInput = (function() {
	function ImgInput($container, $dropZone, tutorialUrl) {
		var imgInput = this,
			//$fileInput = $('<input type="file" accept="image/*" class="upload-input">').appendTo( document.body ),
			/*$buttons = $('<div class="start-buttons"/>').appendTo( $container ),
			$selectButton = $('<div role="button" class="select-btn lg-button">Open Image</div>').appendTo( $buttons ),
			$demoButton = $('<div role="button" class="demo-btn lg-button">Show Example</div>').appendTo( $buttons ),*/
			$dropIndicator = $('<div class="drop-indicator"></div>').appendTo( $dropZone );

		imgInput.fileName = 'example.png';
		//imgInput._fileInput = $fileInput[0];
		imgInput._addDropEvents($dropZone);
		//imgInput._lastFile = undefined;
		
		/*$fileInput.change(function(event) {
			var file = this.files[0];
			file && imgInput._openFileAsImg(file);
			this.value = '';
		});
		
		imgInput.fileClickjackFor( $selectButton );
		
		$demoButton.click(function(event) {
			imgInput.loadImgUrl( tutorialUrl );
			event.preventDefault();
		});*/
		
	}
	
	var ImgInputProto = ImgInput.prototype = new spriteCow.MicroEvent;
	
	ImgInputProto._openFileAsImg = function(file) {
		var imgInput = this,
			reader = new FileReader;
		
		imgInput._lastFile = file;
		imgInput.fileName = file.fileName || file.name;
		
		reader.onload = function() {
			imgInput.loadImgUrl(reader.result);
		};
		reader.readAsDataURL(file);
	};
	
	ImgInputProto._addDropEvents = function($dropZone) {
		var dropZone = $dropZone[0],
			imgInput = this;

		dropZone.addEventListener('dragenter', function(event) {
			event.stopPropagation();
			event.preventDefault();
		}, false);
		
		dropZone.addEventListener('dragover', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.addClass('drag-over');
		}, false);
		
		dropZone.addEventListener('dragleave', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.removeClass('drag-over');
		}, false);
		
		dropZone.addEventListener('drop', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.removeClass('drag-over');
			var file = event.dataTransfer.files[0];
			
			if ( file && file.type.slice(0,5) === 'image' ) {
				imgInput._openFileAsImg(file);
			}
		}, false);
	};
	
	ImgInputProto.loadImgUrl = function(url) {
		var imgInput = this,
			img = new Image;
		
		img.onload = function() {
			imgInput.trigger('load', img);
		};
		img.src = url;
	};
	
	ImgInputProto.reloadLastFile = function() {
		this._lastFile && this._openFileAsImg( this._lastFile );
	};
	
	/*ImgInputProto.fileClickjackFor = function( $elm ) {
		$elm.fileClickjack( this._fileInput );
	};*/
	
	return ImgInput;
})();

// SpriteCanvas

spriteCow.SpriteCanvas = (function() {
	function pixelsEquivalent(pixels1, offset1, pixels2, offset2) {
		if ( pixels1[offset1 + 3] === 0 && pixels2[offset2 + 3] === 0 ) {
			// if both have alpha zero, they're the same
			return true;
		}
		// otherwise only true if both pixels have equal RGBA vals
		for (var i = 4; i--;) if ( pixels1[offset1 + i] !== pixels2[offset2 + i] ) {
			return false;
		}
		return true;
	};
	
	function allArrayOrTrue(arr1, arr2) {
		for (var i = arr1.length; i--;) if ( !( arr1[i] || arr2[i] ) ) {
			return false;
		}
		return true;
	}
	
	function allArrayFalse(arr1) {
		for (var i = arr1.length; i--;) if ( arr1[i] ) {
			return false;
		}
		return true;
	}
	
	function SpriteCanvas() {
		var canvas = $('<canvas/>')[0];
		this.canvas = canvas;
		this._context = canvas.getContext('2d');
		this._bgData = [0, 0, 0, 0];
	}
	
	var SpriteCanvasProto = SpriteCanvas.prototype = new spriteCow.MicroEvent;
	
	SpriteCanvasProto.setImg = function(img) {
		var canvas = this.canvas,
			context = this._context;

		canvas.width = img.width;
		canvas.height = img.height;
		
		context.drawImage(img, 0, 0);
		
		this._img = img;
	};
	
	SpriteCanvasProto.setBg = function(pixelArr) {
		this._bgData = pixelArr;
	};
	
	SpriteCanvasProto.getBg = function() {
		return this._bgData;
	};
	
	SpriteCanvasProto.trimBg = function(rect) {
		var edgeBgResult;
		
		rect = this._restrictRectToBoundry(rect);
		
		if (rect.width && rect.height) do {
			edgeBgResult = this._edgesAreBg(rect);
			rect = this._contractRect(rect, edgeBgResult);
		} while ( rect.height && rect.width && !allArrayFalse(edgeBgResult) );
		
		return rect;
	};
	
	SpriteCanvasProto._restrictRectToBoundry = function(rect) {
		var canvas = this.canvas,
			restrictedX = Math.min( Math.max(rect.x, 0), canvas.width ),
			restrictedY = Math.min( Math.max(rect.y, 0), canvas.height );
		
		if (restrictedX !== rect.x) {
			rect.width -= restrictedX - rect.x;
			rect.x = restrictedX;
		}
		if (restrictedY !== rect.y) {
			rect.height -= restrictedY - rect.y;
			rect.y = restrictedY;
		}
		rect.width  = Math.min(rect.width,  canvas.width - rect.x);
		rect.height = Math.min(rect.height, canvas.height - rect.y);
		return rect;
	}
	
	SpriteCanvasProto.expandToSpriteBoundry = function(rect, callback) {
		var edgeBgResult = this._edgesAreBg(rect),
			edgeBoundsResult = this._edgesAtBounds(rect);
			
		// expand
		while ( !allArrayOrTrue(edgeBgResult, edgeBoundsResult) ) {
			rect = this._expandRect(rect, edgeBgResult, edgeBoundsResult);
			edgeBgResult = this._edgesAreBg(rect);
			edgeBoundsResult = this._edgesAtBounds(rect);
			// callback(); // for debugging
		}
		
		// trim edges of bg
		rect = this._contractRect(rect, edgeBgResult);
		
		return rect;
	};
	
	SpriteCanvasProto._edgesAreBg = function(rect) {
		// look at the pixels around the edges
		var canvas = this.canvas,
			context = this._context,
			top    = context.getImageData(rect.x, rect.y, rect.width, 1).data,
			right  = context.getImageData(rect.x + rect.width - 1, rect.y, 1, rect.height).data,
			bottom = context.getImageData(rect.x, rect.y + rect.height - 1, rect.width, 1).data,
			left   = context.getImageData(rect.x, rect.y, 1, rect.height).data;
			
		
		return [
			this._pixelsContainOnlyBg(top),
			this._pixelsContainOnlyBg(right),
			this._pixelsContainOnlyBg(bottom),
			this._pixelsContainOnlyBg(left)
		];
	};
	
	SpriteCanvasProto._edgesAtBounds = function(rect) {
		var canvas = this.canvas;
		
		return [
			rect.y === 0,
			rect.x + rect.width === canvas.width,
			rect.y + rect.height === canvas.height,
			rect.x === 0
		];
	};
	
	SpriteCanvasProto._pixelsContainOnlyBg = function(pixels) {
		var bg = this._bgData;
		
		for (var i = 0, len = pixels.length; i < len; i += 4) {
			if ( !pixelsEquivalent(bg, 0, pixels, i) ) {
				return false;
			}
		}
		return true;
	};
	
	SpriteCanvasProto._expandRect = function(rect, edgeBgResult, edgeBoundsResult) {
		if ( !edgeBgResult[0] && !edgeBoundsResult[0] ) {
			rect.y--;
			rect.height++;
		}
		if ( !edgeBgResult[1] && !edgeBoundsResult[1] ) {
			rect.width++;
		}
		if ( !edgeBgResult[2] && !edgeBoundsResult[2] ) {
			rect.height++;
		}
		if ( !edgeBgResult[3] && !edgeBoundsResult[3] ) {
			rect.x--;
			rect.width++;
		}
		
		return rect;
	};
	
	SpriteCanvasProto._contractRect = function(rect, edgeBgResult) {
		if ( edgeBgResult[0] && rect.height ) {
			rect.y++;
			rect.height--;
		}
		if ( edgeBgResult[1] && rect.width ) {
			rect.width--;
		}
		if ( edgeBgResult[2] && rect.height ) {
			rect.height--;
		}
		if ( edgeBgResult[3] && rect.width ) {
			rect.x++;
			rect.width--;
		}
		
		return rect;
	};
	
	return SpriteCanvas;
})();

// SpriteCanvasView
(function() {
	var Highlight = (function() {
		function Highlight($appendTo) {
			this._$container = $('<div class="highlight"/>').appendTo( $appendTo );
		}
		
		var HighlightProto = Highlight.prototype;
		
		HighlightProto.moveTo = function(rect, animate) {
			var $container = this._$container.transitionStop(true),
				destination = {
					left: rect.x,
					top: rect.y,
					width: rect.width,
					height: rect.height,
					opacity: 1
				};
			
			
			if (rect.width && rect.height) {
				$container.css('display', 'block');
				
				if (animate) {
					$container.transition(destination, {
						duration: 200,
						easing: 'easeOutQuad'
					});
				}
				else {					
					$container.vendorCss(destination);				
				}
			}
			else {
				this.hide(animate);
			}
		};
		
		HighlightProto.hide = function(animate) {
			var $container = this._$container.transitionStop(true);
			
			if (animate) {
				var currentLeft = parseInt( $container.css('left') ),
					currentTop = parseInt( $container.css('top') );
				
				$container.transition({
					left: currentLeft + $container.width()  / 2,
					top:  currentTop  + $container.height() / 2,
					width: 0,
					height: 0,
					opacity: 0
				}, {
					duration: 200,
					easing: 'easeInQuad'
				});
			}
			else {
				$container.css('display', 'none');
			}
		};
		
		HighlightProto.setHighVisOnDark = function(highVis) {
			this._$container[highVis ? 'addClass' : 'removeClass']('high-vis');
			return this;
		}
		
		return Highlight;
	})();
	
	var SelectColor = (function() {
		
		function SelectColor($eventArea, $canvas) {
			this._$canvas = $canvas;
			this._$eventArea = $eventArea;
			this._context = $canvas[0].getContext('2d');
			this._listeners = [];
		}
		
		var SelectColorProto = SelectColor.prototype = new spriteCow.MicroEvent;
		
		SelectColorProto.activate = function() {
			var selectColor = this,
				canvasX, canvasY,
				context = selectColor._context,
				$eventArea = selectColor._$eventArea;
			
			selectColor._listeners.push([
				$eventArea, 'mousedown', function(event) {
					if (event.button !== 0) { return; }
					var color = selectColor._getColourAtMouse(event.pageX, event.pageY);
					selectColor.trigger( 'select', color );
					event.preventDefault();
				}
			]);
			
			selectColor._listeners.push([
				$eventArea, 'mousemove', function(event) {
					var color = selectColor._getColourAtMouse(event.pageX, event.pageY);
					selectColor.trigger( 'move', color );
				}
			]);
			
			selectColor._listeners.forEach(function(set) {
				set[0].bind.apply( set[0], set.slice(1) );
			});
			
			return selectColor;
		};
		
		SelectColorProto.deactivate = function() {
			this._listeners.forEach(function(set) {
				set[0].unbind.apply( set[0], set.slice(1) );
			});
			
			return this;
		};
		
		SelectColorProto._getColourAtMouse = function(pageX, pageY) {
			var offset = this._$canvas.offset(),
				x = pageX - Math.floor(offset.left),
				y = pageY - Math.floor(offset.top);
			
			return this._context.getImageData(x, y, 1, 1).data;
		};
		
		return SelectColor;
	})();
	
	var SelectArea = (function() {
		function SelectArea($eventArea, $area, highlight) {
			this._$area = $area;
			this._$eventArea = $eventArea;
			this._highlight = highlight;
			this._listeners = [];
		}
		
		var SelectAreaProto = SelectArea.prototype = new spriteCow.MicroEvent;
		
		SelectAreaProto.activate = function() {
			var selectArea = this,
				rect = new spriteCow.Rect(0, 0, 0, 0),
				startX, startY,
				startPositionX, startPositionY,
				isDragging,
				$document = $(document);
			
			
			selectArea._listeners.push([
				selectArea._$eventArea, 'mousedown', function(event) {
					if (event.button !== 0) { return; }
					var offset = selectArea._$area.offset();
					startX = event.pageX;
					startY = event.pageY;
					// firefox like coming up with fraction values from offset()
					startPositionX = Math.floor(event.pageX - offset.left);
					startPositionY = Math.floor(event.pageY - offset.top);
					
					rect = new spriteCow.Rect(
						startPositionX,
						startPositionY,
						1, 1
					);
					
					selectArea._highlight.moveTo(rect);
					isDragging = true;
					event.preventDefault();
				}
			]);
			
			selectArea._listeners.push([
				$document, 'mousemove', function(event) {
					if (!isDragging) { return; }
					
					rect.x = startPositionX + Math.min(event.pageX - startX, 0);
					rect.y = startPositionY + Math.min(event.pageY - startY, 0);
					rect.width = Math.abs(event.pageX - startX) || 1;
					rect.height = Math.abs(event.pageY - startY) || 1;
					selectArea._highlight.moveTo(rect);
				}
			]);
			
			selectArea._listeners.push([
				$document, 'mouseup', function(event) {
					if (!isDragging) { return; }
					isDragging = false;
					selectArea.trigger('select', rect);
				}
			]);
			
			selectArea._listeners.forEach(function(set) {
				set[0].bind.apply( set[0], set.slice(1) );
			});
			
			return selectArea;
		};
		
		SelectAreaProto.deactivate = function() {
			this._listeners.forEach(function(set) {
				set[0].unbind.apply( set[0], set.slice(1) );
			});
			
			return this;
		};
		
		return SelectArea;
	})();
	
	spriteCow.SpriteCanvasView = (function() {
		function SpriteCanvasView(spriteCanvas, $appendToElm) {
			var spriteCanvasView = this,
				$container = $('<div class="sprite-canvas-container"/>'),
				$canvas = $( spriteCanvas.canvas ).appendTo( $container ),
				// this cannot be $appendToElm, as browsers pick up clicks on scrollbars, some don't pick up mouseup http://code.google.com/p/chromium/issues/detail?id=14204#makechanges
				highlight = new Highlight( $container ),
				selectArea = new SelectArea( $container, $canvas, highlight ),
				selectColor = new SelectColor( $canvas, $canvas );
				
			this._$container = $container;
			this._$bgElm = $appendToElm;
			this._spriteCanvas = spriteCanvas;
			this._highlight = highlight;
			this._selectArea = selectArea;
			this._selectColor = selectColor;
			
			$container.appendTo( $appendToElm );
			
			selectArea.bind('select', function(rect) {
				var spriteRect = spriteCanvas.trimBg(rect);
				if (spriteRect.width && spriteRect.height) { // false if clicked on bg pixel
					spriteRect = spriteCanvas.expandToSpriteBoundry(rect);
					spriteCanvasView._setCurrentRect(spriteRect);
				}
				else {
					highlight.hide(true);
				}
			});
			
			selectColor.bind('select', function(color) {
				spriteCanvasView.trigger('bgColorSelect', color);
				spriteCanvasView.setBg(XenForo.SmileySpriteCow.colourBytesToCss(color));
			});
			
			selectColor.bind('move', function(color) {
				spriteCanvasView.trigger('bgColorHover', color);
			});
		}
		
		var SpriteCanvasViewProto = SpriteCanvasView.prototype = new spriteCow.MicroEvent;
		
		SpriteCanvasViewProto._setCurrentRect = function(rect) {
			this._highlight.moveTo(rect, true);
			this.trigger('rectChange', rect);
		};
		
		SpriteCanvasViewProto.setTool = function(mode) {
			var selectArea = this._selectArea,
				selectColor = this._selectColor;
			
			this._highlight.hide();
			selectArea.deactivate();
			selectColor.deactivate();
			
			switch (mode) {
				case 'select-sprite':
					selectArea.activate();
					break;
				case 'select-bg':
					selectColor.activate();
					break;
			}
		};
		
		SpriteCanvasViewProto.setBg = function(color) {
			if ( $.support.transition ) {
				this._$bgElm.transition({ 'background-color': color }, {
					duration: 500
				});								
			}
			else {
				this._$bgElm.css({ 'background-color': color });
			}
			
			this._highlight.setHighVisOnDark( color === '#000' );
		};
		
		return SpriteCanvasView;
	})();
	
})();

// InlineEdit
(function() {
	function InlineEdit( $toWatch ) {
		var $input = $('<input type="text"/>').appendTo( $toWatch );
		var inlineEdit = this;

		inlineEdit._$input = $input;
		inlineEdit._$editing = null;
		inlineEdit._inputBoxOffset = {
			top:  -parseInt( $input.css('padding-top'),  10 ) - parseInt( $input.css('border-top-width'),  10 ),
			left: -parseInt( $input.css('padding-left'), 10 ) - parseInt( $input.css('border-left-width'), 10 )
		};

		$input.hide();
		$toWatch.on('click', '[data-inline-edit]', function(event) {
			var $target = $(event.target);
			var $editing = inlineEdit._$editing;

			if ($editing && $target[0] === $editing[0]) {
				return;
			}
			inlineEdit.edit( $target );
			event.preventDefault();
		});

		$input.blur(function() {
			inlineEdit.finishEdit();
		}).keyup(function(event) {
			if (event.keyCode === 13) {
				$input[0].blur();
				event.preventDefault();
			}
		});
	}

	var InlineEditProto = InlineEdit.prototype = new spriteCow.MicroEvent();

	InlineEditProto.edit = function( $elm ) {
		$elm = $($elm);

		var position = $elm.position();

		if (this._$editing) {
			this.finishEdit();
		}

		this._$editing = $elm;
		this._$input.show().css({
			top: position.top + this._inputBoxOffset.top,
			left: position.left + this._inputBoxOffset.left,
			width: Math.max( $elm.width(), 50 )
		}).val( $elm.text() ).focus();
	};

	InlineEditProto.finishEdit = function() {
		if (!this._$editing) { return; }

		var newVal = this._$input.hide().val();
		var event = new $.Event( this._$editing.data('inlineEdit') );
		
		event.val = newVal;
		this.trigger( event );
		this._$editing = null;
	};

	spriteCow.InlineEdit = InlineEdit;
})();

// CssOutput
spriteCow.CssOutput = (function() {
	function pxVal(val, intVal) {
		val = Math.round(val);
		if (intVal)
		{	
			return val;
		}

		return val ? val + 'px' : '0';
	}

	function bgPercentVal(offset) {
		if (offset) {
			return round(offset * 100, 3) + '%';
		}
		return '0';
	}

	function round(num, afterDecimal) {
		var multiplier = Math.pow(10, afterDecimal || 0);
		return Math.round(num * multiplier) / multiplier;
	}
	
	function CssOutput($appendTo) {
		var $container = $('<div class="css-output"></div>').appendTo( $appendTo );
		this._$container = $container;
		this._$code = $('<code>\n\n\n\n\n</code>').appendTo( $container );
		this.backgroundFileName = '';
		this.path = 'cssOutputPath' in localStorage ? localStorage.getItem('cssOutputPath') : 'imgs/';
		this.rect = new spriteCow.Rect(0, 0, 0, 0);
		this.imgWidth = 0;
		this.imgHeight = 0;
		this.scaledWidth = 0;
		this.scaledHeight = 0;
		this.useTabs = true;
		this.useBgUrl = true;
		this.percentPos = false;
		this.bgSize = false;
		this.selector = '.sprite';
		this._addEditEvents();
		this.output = {};
	}
	
	var CssOutputProto = CssOutput.prototype;
	
	CssOutputProto.update = function() {
		var indent = this.useTabs ? '\t' : '    ';
		var rect = this.rect;
		var $code = this._$code;
		var widthMultiplier = this.bgSize ? this.scaledWidth / this.imgWidth : 1;
		var heightMultiplier = this.bgSize ? this.scaledHeight / this.imgHeight : 1;
		var $file;
		var backgroundUrl = $('#DataSource').val();
		
		$code.empty()
			.append( $('<span class="selector"/>').text(this.selector) )
			.append(' {\n');
		
		if (this.useBgUrl && this.backgroundFileName) {
			$code.append( indent + "background: url('" );
			$file = $('<span class="file"/>')
				/*.append( $('<span data-inline-edit="file-path"/>').text( this.path ) )
				.append( $('<span class="file-name"/>').text( this.backgroundFileName ) );*/
				.append( $('<span class="file-name"/>').text( backgroundUrl ) );
			
			$code.append( $file ).append( "') no-repeat " );
		}
		else {
			$code.append( indent + "background-position: " );
		}

		if (this.percentPos) {
			$code.append(
				'<span id="spriteX">' + bgPercentVal( rect.x / -(rect.width - this.imgWidth) ) + '</span> ' +
				'<span id="spriteY">' + bgPercentVal( rect.y / -(rect.height - this.imgHeight) ) + '</span>;\n'
			);
		}
		else {
			$code.append(
				'<span id="spriteX">' + pxVal(-rect.x * widthMultiplier) + '</span> ' +
				'<span id="spriteY">' + pxVal(-rect.y * heightMultiplier) + '</span>;\n'
			);
		}

		if (this.bgSize) {
			$code.append(
				indent + 'background-size: ' +
				pxVal(this.scaledWidth) + ' ' +
				pxVal(this.scaledHeight) + ';\n'
			);
		}
		
		$code.append(
			indent + 'width: <span id="spriteWidth">' + pxVal(rect.width * widthMultiplier) + '</span>;\n' +
			indent + 'height: <span id="spriteHeight">' + pxVal(rect.height * heightMultiplier) + '</span>;\n' +
			'}'
		);

		$.extend(this.output,
		{
			width: pxVal(rect.width * widthMultiplier, true),
			height: pxVal(rect.height * heightMultiplier, true),
			x: pxVal(-rect.x * widthMultiplier, true),
			y: pxVal(-rect.y * heightMultiplier, true)
		});
	};
	
	CssOutputProto._addEditEvents = function() {
		var cssOutput = this;

		new spriteCow.InlineEdit( cssOutput._$container ).bind('file-path', function(event) {
			var newVal = event.val;
			cssOutput.path = newVal;
			cssOutput.update();
			localStorage.setItem('cssOutputPath', newVal);
		});
	};
	
	return CssOutput;
})();

// Toolbar
spriteCow.Toolbar = (function() {
	function SpriteCowToolbar($appendToElm) {
		var toolbar = this,
			$container = $('' +
				'<div class="toolbar">' +
					'<span class="feedback"></span>' +
				'</div>' +
			'').appendTo( $appendToElm );
		
		$container.on('mouseenter', 'div[role=button]', function() {
			var $button = $(this);
			toolbar.feedback( $button.hasClass('no-label') ? $button.text() : '' );
		});

		$container.on('click', 'div[role=button]', function() {
			var $button = $(this),
				toolName = $button.data('toolName'),
				event = new $.Event( toolName );
			
			event.isActive = $button.hasClass('active');

			if ( !toolbar.trigger(event).isDefaultPrevented() ) {
				if (event.isActive) {
					toolbar.deactivate(toolName);
				}
				else {
					toolbar.activate(toolName);
				}
			}

			event.preventDefault();
		});
		
		toolbar.$container = $container;
		toolbar._$feedback = $container.find('span.feedback');
	}
	
	SpriteCowToolbar.createButton = function(toolName, text, opts) {
		opts = opts || {};

		var $button = $('<div role="button"/>').addClass(toolName).text(text).data('toolName', toolName);

		if (opts.noLabel) {
			$button.addClass('no-label');
		}
		if (opts.active) {
			$button.addClass('active');
		}

		return $button;
	};

	var SpriteCowToolbarProto = SpriteCowToolbar.prototype = new spriteCow.MicroEvent();
	
	SpriteCowToolbarProto.addItem = function(toolName, text, opts) {
		if (toolName instanceof spriteCow.ToolbarGroup) {
			this._$feedback.before( toolName.$container );
		}
		else {
			SpriteCowToolbar.createButton(toolName, text, opts).insertBefore( this._$feedback );
		}

		return this;
	};

	SpriteCowToolbarProto.feedback = function(msg, severe) {
		var $feedback = this._$feedback,
			initialColor = '#555';
		
		// opacity 0.999 to avoid antialiasing differences when 1
		$feedback.transitionStop(true).text(msg).css({
			opacity: 0.999,
			color: initialColor,
			'font-weight': 'normal'
		});
		
		if (severe) {
			$feedback.css('font-weight', 'bold');
			
			if ($.support.transition) {
				$feedback.transition({ color: 'red' }, {
					duration: 3000
				});
			}
			else {
				$feedback.css('color', 'red');
			}
		}
		else {
			$feedback.animate({
				// should be using delay() here, but http://bugs.jquery.com/ticket/6150 makes it not work
				// need to specify a dummy property to animate, cuh!
				_:0
			}, 3000);
		}
		
		$feedback.transition({ opacity: 0 }, {
			duration: 2000
		});
		
		return this;
	};
	
	SpriteCowToolbarProto.activate = function(toolName) {
		var $button = this.$container.find('.' + toolName + '[role=button]');
		$button.closest('.toolbar-group').children().removeClass('active');
		$button.addClass('active');
		return this;
	};
	
	SpriteCowToolbarProto.deactivate = function(toolName) {
		this.$container.find('.' + toolName + '[role=button]').removeClass('active');
		return this;
	};
	
	SpriteCowToolbarProto.isActive = function(toolName) {
		return this.$container.find('.' + toolName + '[role=button]').hasClass('active');
	};
	
	return SpriteCowToolbar;
})();
	
(function() {
	function ToolbarGroup() {
		this.$container = $('<div class="toolbar-group"/>');
	}

	var ToolbarGroupProto = ToolbarGroup.prototype;

	ToolbarGroupProto.addItem = function(toolName, text, opts) {
		spriteCow.Toolbar.createButton(toolName, text, opts).appendTo( this.$container );
		return this;
	};

	spriteCow.ToolbarGroup = ToolbarGroup;
})();

// pageLayout
spriteCow.pageLayout = (function() {
	var $container = $('.container'),
		$canvasCell = $('.canvas-cell'),
		$canvasInner = $('.canvas-inner'),
		$cssOutput,
		$startButtons,
		$spriteCanvasContainer,
		$window = $(window),
		$toolbarTop,
		$toolbarBottom,
		currentView = 'intro';
	
	function getContainerWidthPercent() {
		var bodyHorizontalPadding = 40,
			containerRelativeWidth = $container.width() / ( $window.width() - bodyHorizontalPadding );
		
		return Math.round(containerRelativeWidth * 10000) / 100 + '%';
	}
	
	function getAppViewTransitions() {
		// Here we read all the destination styles to animate to when the intro class is removed
		var transitions,
			containerWidth = getContainerWidthPercent();
		
		$container.removeClass('intro');
		
		transitions = [
			{
				duration: 300,
				easing: 'easeInOutQuad',
				targets: [
					[$container, { width: '100%' }],
					[$startButtons, { opacity: 0 }]
				],
				before: function() {
					$container.width(containerWidth);
					// stops browser reverting to previous scroll position
					$canvasInner.scrollTop(0);
				}
			},
			{
				duration: 500,
				easing: 'easeInOutQuad',
				targets: [
					[$container, { width: '100%' }],
					[$cssOutput, {
						height: $cssOutput.height(),
						'padding-top': $cssOutput.css('padding-top'),
						'padding-bottom': $cssOutput.css('padding-bottom')
					}],
					[$canvasCell, {
						height: $canvasCell.height()
					}],
					[$toolbarTop, {
						height: $toolbarTop.height(),
						'padding-top': $toolbarTop.css('padding-top'),
						'padding-bottom': $toolbarTop.css('padding-bottom'),
						'border-top-width': $toolbarTop.css('border-top-width'),
						'border-bottom-width': $toolbarTop.css('border-bottom-width')
					}],
					[$toolbarBottom, {
						height: $toolbarBottom.height(),
						'padding-top': $toolbarBottom.css('padding-top'),
						'padding-bottom': $toolbarBottom.css('padding-bottom'),
						'border-top-width': $toolbarBottom.css('border-top-width'),
						'border-bottom-width': $toolbarBottom.css('border-bottom-width')
					}]
				],
				before: function() {
				}
			},
			{
				duration: 500,
				easing: 'swing',
				targets: [
					[$spriteCanvasContainer, {opacity: 1}]
				]
			}
		];
		
		$container.addClass('intro');
		
		return transitions;
	}
	
	function doAnimStep(steps, i, callback) {
		var nextStep = steps[i+1],
			step = steps[i],
			duration = step.duration,
			easing = step.easing;
		
		function complete() {
			if (nextStep) {
				doAnimStep(steps, i + 1, callback);
			}
			else {
				callback();
			}
		}
		
		if (step.before) {
			step.before();
		}
		
		step.targets.forEach(function(target, i, targets) {
			target[0].transition(target[1], {
				duration: duration,
				easing: easing,
				complete: i ? $.noop : complete
			});
		});
	}
	
	return {
		init: function() {
			$toolbarTop = $('.toolbar.top');
			$toolbarBottom = $('.toolbar.bottom');
			$startButtons = $('.start-buttons');
			$cssOutput = $('.css-output');
			$spriteCanvasContainer = $('.sprite-canvas-container');
		},
		toAppView: function() {
			if (currentView === 'app') { return; }
			
			var steps = getAppViewTransitions(),
				i = 0;
				
			currentView = 'app';

			if ($.support.transition) {
				doAnimStep(steps, 0, function() {
					var targets = [];
					
					$container.removeClass('intro');
					
					steps.forEach(function(step) {
						targets = targets.concat( step.targets );
					});
					
					targets.forEach(function(target) {
						for ( var propName in target[1] ) {
							target[0].css(propName, '');
						}
					});
				});
			}
			else {
				$container.removeClass('intro');
			}

		}
	};
})();

// FeatureTest
spriteCow.FeatureTest = (function() {
	function FeatureTest($appendTo) {
		var $container = $('<div class="feature-test-results" />'),
			$results = $('<ul/>');
		
		this._$container = $container.appendTo($appendTo);
		this._$results = $results.appendTo($container);
		this.allPassed = true;
	}
	
	var FeatureTestProto = FeatureTest.prototype;
	
	FeatureTestProto.addResult = function(pass, msg) {
		this.allPassed = this.allPassed && pass;
		
		$('<li/>').text(msg).prepend( pass ? '<span class="pass">pass</span> ' : '<span class="fail">fail</span> ' )
			.appendTo( this._$results );
	};
	
	return FeatureTest;
})();

// featureTests
spriteCow.featureTests = (function(document) {
	var testElm = document.createElement('a'),
		docElm = document.documentElement;
	
	function canvas() {
		return !!document.createElement('canvas').getContext;
	}
	function fileApi() {
		return !!( window.File && window.FileReader );
	}
	function w3EventListeners() {
		return !!testElm.addEventListener;
	}
	
	var featureTests = new spriteCow.FeatureTest( $('.feature-test') );
	
	featureTests.addResult( canvas(), '<canvas> element' );
	featureTests.addResult( fileApi(), 'File & FileReader' );
	featureTests.addResult( w3EventListeners(), 'addEventListener on elements' );
	
	if ($.browser.opera) { // I feel dirty, need these for some CSS tweaks
		docElm.className += ' opera';	
	}
	
	return featureTests;
})(document);


spriteCow.XenForoSmiley = (function() {
	i = 1;

	function XenForoSmiley(cssOutput) {
		$.extend(cssOutput,
		{
			key: i
		});
		
		XenForo.SmileySpriteCow.add(cssOutput);
		i++;
	}
	
	
	return XenForoSmiley;
})();

