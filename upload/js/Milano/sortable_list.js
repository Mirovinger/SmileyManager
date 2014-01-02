!function($, window, document, _undefined)
{
	XenForo.SortableList = function($list) { this.__construct($list); };
	XenForo.SortableList.prototype =
	{
		__construct: function($list)
		{
			this.$form = $list.closest('form');
			$handle = '.' + String($list.data('handle') || 'handle');

			this.$list = $list.sortable({
				handle: $handle,
				onDrag: $.context(this, 'onDrag'),
				onDragStart: $.context(this, 'onDragStart'),
				onDrop: $.context(this, 'onDrop'),
				serialize: $.context(this, 'serialize'),
			});

			var adjustment;
		},

		onDrop: function(item, container, _super) 
		{
			this.saveOnDrop(parseInt(item.attr('id').replace(/[^\d]/g, '')));
			_super(item, container);
		},

		onDragStart: function($item, container, _super) 
		{
		    var offset = $item.offset(),
		    	pointer = container.rootGroup.pointer

		    adjustment = {
		    	left: pointer.left - offset.left,
		    	top: pointer.top - offset.top
		    }

		    _super($item, container);
		},

		onDrag: function($item, position) 
		{
		    $item.css({
		    	position: 'absolute',
		    	opacity: 0.5,
		    	left: position.left - adjustment.left,
		    	top: position.top - adjustment.top
		    });
		},

		serialize: function (parent, children, isContainer) 
		{
    		return isContainer ? children.join() : parseInt(parent.attr('id').replace(/[^\d]/g, ''));
  		},

  		saveOnDrop: function(id)
  		{
  			if (!id || id === undefined)
  			{
  				return;
  			}

  			var order = (this.$list.sortable('serialize').get(0));
  			serialized = this.$form.serializeArray();

			serialized.push(
			{
				name: 'order',
				value: order
			},
			{
				name: 'smilie_id',
				value: id
			});

			XenForo.ajax
			(
				this.$form.attr('action'),
				serialized,
				function(ajaxData, textStatus)
				{
					if (XenForo.hasResponseError(ajaxData))
					{
						return;
					}

					XenForo.alert(ajaxData._redirectMessage, '', 2500);
				}
			);
  		}
	};

	// *********************************************************************

	XenForo.register('.SortableList', 'XenForo.SortableList');

}
(jQuery, this, document);

/* 
 *  jquery-sortable.js v0.9.11
 *  http://johnny.github.com/jquery-sortable/
 */
!function(a,b,c){function k(a,b){var c=Math.max(0,a[0]-b[0],b[0]-a[1]),d=Math.max(0,a[2]-b[1],b[1]-a[3]);return c+d}function l(b,c,d,e){var f=b.length,g=e?"offset":"position";for(d=d||0;f--;){var h=b[f].el?b[f].el:a(b[f]),i=h[g]();i.left+=parseInt(h.css("margin-left"),10),i.top+=parseInt(h.css("margin-top"),10),c[f]=[i.left-d,i.left+h.outerWidth()+d,i.top-d,i.top+h.outerHeight()+d]}}function m(a,b){var c=b.offset();return{left:a.left-c.left,top:a.top-c.top}}function n(a,b,c){b=[b.left,b.top],c=c&&[c.left,c.top];for(var d,e=a.length,f=[];e--;)d=a[e],f[e]=[e,k(d,b),c&&k(d,c)];return f=f.sort(function(a,b){return b[1]-a[1]||b[2]-a[2]||b[0]-a[0]})}function o(b){this.options=a.extend({},g,b),this.containers=[],this.scrollProxy=a.proxy(this.scroll,this),this.dragProxy=a.proxy(this.drag,this),this.dropProxy=a.proxy(this.drop,this),this.options.parentContainer||(this.placeholder=a(this.options.placeholder),b.isValidTarget||(this.options.isValidTarget=c))}function p(b,c){this.el=b,this.options=a.extend({},f,c),this.group=o.get(this.options),this.rootGroup=this.options.rootGroup=this.options.rootGroup||this.group,this.parentContainer=this.options.parentContainer,this.handle=this.rootGroup.options.handle||this.rootGroup.options.itemSelector,this.el.on(d.start,this.handle,a.proxy(this.dragInit,this)),this.options.drop&&this.group.containers.push(this)}var d,e="sortable",f={drag:!0,drop:!0,exclude:"",nested:!0,vertical:!0},g={afterMove:function(){},containerPath:"",containerSelector:"ol, ul",distance:0,handle:"",itemPath:"",itemSelector:"li",isValidTarget:function(){return!0},onCancel:function(){},onDrag:function(a,b){a.css(b)},onDragStart:function(b){b.css({height:b.height(),width:b.width()}),b.addClass("dragged"),a("body").addClass("dragging")},onDrop:function(b){b.removeClass("dragged").removeAttr("style"),a("body").removeClass("dragging")},onMousedown:function(a,b){b.preventDefault()},placeholder:'<li class="placeholder"/>',pullPlaceholder:!0,serialize:function(b,c,d){var e=a.extend({},b.data());return d?c:(c[0]&&(e.children=c,delete e.subContainer),delete e.sortable,e)},tolerance:0},h={},i=0,j={left:0,top:0,bottom:0,right:0};d={start:"touchstart.sortable mousedown.sortable",drop:"touchend.sortable touchcancel.sortable mouseup.sortable",drag:"touchmove.sortable mousemove.sortable",scroll:"scroll.sortable"},o.get=function(a){return h[a.group]||(a.group||(a.group=i++),h[a.group]=new o(a)),h[a.group]},o.prototype={dragInit:function(b,c){this.$document=a(c.el[0].ownerDocument),c.enabled()?(this.toggleListeners("on"),this.item=a(b.target).closest(this.options.itemSelector),this.itemContainer=c,this.setPointer(b),this.options.onMousedown(this.item,b,g.onMousedown)):this.toggleListeners("on",["drop"]),this.dragInitDone=!0},drag:function(a){if(!this.dragging){if(!this.distanceMet(a))return;this.options.onDragStart(this.item,this.itemContainer,g.onDragStart),this.item.before(this.placeholder),this.dragging=!0}this.setPointer(a),this.options.onDrag(this.item,m(this.pointer,this.item.offsetParent()),g.onDrag);var b=a.pageX,c=a.pageY,d=this.sameResultBox,e=this.options.tolerance;(!d||d.top-e>c||d.bottom+e<c||d.left-e>b||d.right+e<b)&&(this.searchValidTarget()||this.placeholder.detach())},drop:function(){this.toggleListeners("off"),this.dragInitDone=!1,this.dragging&&(this.placeholder.closest("html")[0]?this.placeholder.before(this.item).detach():this.options.onCancel(this.item,this.itemContainer,g.onCancel),this.options.onDrop(this.item,this.getContainer(this.item),g.onDrop),this.clearDimensions(),this.clearOffsetParent(),this.lastAppendedItem=this.sameResultBox=c,this.dragging=!1)},searchValidTarget:function(a,b){a||(a=this.relativePointer||this.pointer,b=this.lastRelativePointer||this.lastPointer);for(var d=n(this.getContainerDimensions(),a,b),e=d.length;e--;){var f=d[e][0],g=d[e][1];if(!g||this.options.pullPlaceholder){var h=this.containers[f];if(!h.disabled){if(!this.$getOffsetParent()){var i=h.getItemOffsetParent();a=m(a,i),b=m(b,i)}if(h.searchValidTarget(a,b))return!0}}}this.sameResultBox&&(this.sameResultBox=c)},movePlaceholder:function(a,b,c,d){var e=this.lastAppendedItem;(d||!e||e[0]!==b[0])&&(b[c](this.placeholder),this.lastAppendedItem=b,this.sameResultBox=d,this.options.afterMove(this.placeholder,a))},getContainerDimensions:function(){return this.containerDimensions||l(this.containers,this.containerDimensions=[],this.options.tolerance,!this.$getOffsetParent()),this.containerDimensions},getContainer:function(a){return a.closest(this.options.containerSelector).data(e)},$getOffsetParent:function(){if(this.offsetParent===c){var a=this.containers.length-1,b=this.containers[a].getItemOffsetParent();if(!this.options.parentContainer)for(;a--;)if(b[0]!=this.containers[a].getItemOffsetParent()[0]){b=!1;break}this.offsetParent=b}return this.offsetParent},setPointer:function(a){var b={left:a.pageX,top:a.pageY};if(this.$getOffsetParent()){var c=m(b,this.$getOffsetParent());this.lastRelativePointer=this.relativePointer,this.relativePointer=c}this.lastPointer=this.pointer,this.pointer=b},distanceMet:function(a){return Math.max(Math.abs(this.pointer.left-a.pageX),Math.abs(this.pointer.top-a.pageY))>=this.options.distance},scroll:function(){this.clearDimensions(),this.clearOffsetParent()},toggleListeners:function(b,c){var e=this;c=c||["drag","drop","scroll"],a.each(c,function(a,c){e.$document[b](d[c],e[c+"Proxy"])})},clearOffsetParent:function(){this.offsetParent=c},clearDimensions:function(){this.containerDimensions=c;for(var a=this.containers.length;a--;)this.containers[a].clearDimensions()}},p.prototype={dragInit:function(b){var c=this.rootGroup;c.dragInitDone||1!==b.which||!this.options.drag||a(b.target).is(this.options.exclude)||c.dragInit(b,this)},searchValidTarget:function(a,b){var c=n(this.getItemDimensions(),a,b),d=c.length,e=this.rootGroup,f=!e.options.isValidTarget||e.options.isValidTarget(e.item,this);if(!d&&f)return e.movePlaceholder(this,this.el,"append"),!0;for(;d--;){var g=c[d][0],h=c[d][1];if(!h&&this.hasChildGroup(g)){var i=this.getContainerGroup(g).searchValidTarget(a,b);if(i)return!0}else if(f)return this.movePlaceholder(g,a),!0}},movePlaceholder:function(b,c){var d=a(this.items[b]),e=this.itemDimensions[b],f="after",g=d.outerWidth(),h=d.outerHeight(),i=d.offset(),k={left:i.left,right:i.left+g,top:i.top,bottom:i.top+h};if(this.options.vertical){var l=(e[2]+e[3])/2,m=c.top<=l;m?(f="before",k.bottom-=h/2):k.top+=h/2}else{var n=(e[0]+e[1])/2,o=c.left<=n;o?(f="before",k.right-=g/2):k.left+=g/2}this.hasChildGroup(b)&&(k=j),this.rootGroup.movePlaceholder(this,d,f,k)},getItemDimensions:function(){return this.itemDimensions||(this.items=this.$getChildren(this.el,"item").filter(":not(.placeholder, .dragged)").get(),l(this.items,this.itemDimensions=[],this.options.tolerance)),this.itemDimensions},getItemOffsetParent:function(){var a,b=this.el;return a="relative"===b.css("position")||"absolute"===b.css("position")||"fixed"===b.css("position")?b:b.offsetParent()},hasChildGroup:function(a){return this.options.nested&&this.getContainerGroup(a)},getContainerGroup:function(b){var d=a.data(this.items[b],"subContainer");if(d===c){var f=this.$getChildren(this.items[b],"container");if(d=!1,f[0]){var g=a.extend({},this.options,{parentContainer:this,group:i++});d=f[e](g).data(e).group}a.data(this.items[b],"subContainer",d)}return d},enabled:function(){return!this.disabled&&(!this.parentContainer||this.parentContainer.enabled())},$getChildren:function(b,c){var d=this.rootGroup.options,e=d[c+"Path"],f=d[c+"Selector"];return b=a(b),e&&(b=b.find(e)),b.children(f)},_serialize:function(b,c){var d=this,e=c?"item":"container",f=this.$getChildren(b,e).not(this.options.exclude).map(function(){return d._serialize(a(this),!c)}).get();return this.rootGroup.options.serialize(b,f,c)},clearDimensions:function(){if(this.itemDimensions=c,this.items&&this.items[0])for(var b=this.items.length;b--;){var d=a.data(this.items[b],"subContainer");d&&d.clearDimensions()}}};var q={enable:function(){this.disabled=!1},disable:function(){this.disabled=!0},serialize:function(){return this._serialize(this.el,!0)}};a.extend(p.prototype,q),a.fn[e]=function(b){var d=Array.prototype.slice.call(arguments,1);return this.map(function(){var f=a(this),g=f.data(e);return g&&q[b]?q[b].apply(g,d)||this:(g||b!==c&&"object"!=typeof b||f.data(e,new p(f,b)),this)})}}(jQuery,window);
