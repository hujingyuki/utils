/**
 * /* 画框后增加resize方法
 *
 * @format
 */

let framePos = []; // 红框位置
/*判断是哪一种浏览器,火狐,谷歌,ie*/
let Sys = (function(ua) {
	let s = {};
	s.IE = !!ua.match(/msie ([\d.]+)/);
	s.Firefox = !!ua.match(/firefox\/([\d.]+)/);
	s.Chrome = !!ua.match(/chrome\/([\d.]+)/);
	s.IE6 = !!(s.IE && [/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 6);
	s.IE7 = !!(s.IE && [/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 7);
	s.IE8 = !!(s.IE && [/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 8);
	return s;
})(navigator.userAgent.toLowerCase());

/*获取元素,模仿jQuery*/
let dom = function(id) {
	return document.getElementById(id);
};

/*更改对象的top,left,width,height来控制对象的大小*/
let Css = function(e, o) {
	for (let i in o) e.style[i] = o[i];
};

/*拷贝对象的属性*/
let Extend = function(destination, source) {
	for (let property in source) {
		destination[property] = source[property];
	}
};

/*直接调用方法*/
let Bind = function(object, fun) {
	let args = Array.prototype.slice.call(arguments).slice(2);
	return function() {
		return fun.apply(object, args);
	};
};

/*直接调用方法,并将事件的类型传入作为第一个参数*/
let BindAsEventListener = function(object, fun) {
	let args = Array.prototype.slice.call(arguments).slice(2);
	return function(event) {
		return fun.apply(object, [event || window.event].concat(args));
	};
};

/*获取当前元素的属性*/
let CurrentStyle = function(element) {
	return element.currentStyle || document.defaultView.getComputedStyle(element, null);
};

/*事件监听,执行对应的函数*/
function addListener(element, e, fn) {
	element.addEventListener ? element.addEventListener(e, fn, false) : element.attachEvent(`on${e}`, fn);
}

/*事件的移除*/
function removeListener(element, e, fn) {
	element.removeEventListener ? element.removeEventListener(e, fn, false) : element.detachEvent(`on${e}`, fn);
}

/*创建一个新的可以拖拽的,变换大小的对象*/
let Class = function(properties) {
	let _class = function() {
		return arguments[0] !== null && this.initialize && typeof this.initialize == 'function'
			? this.initialize.apply(this, arguments)
			: this;
	};
	_class.prototype = properties;
	return _class;
};
let Resize = new Class({
	initialize: function(obj) {
		this.obj = obj;
		this.resizeelm = null;
		this.fun = null; //记录触发什么事件的索引
		this.original = []; //记录开始状态的数组
		this.finial = []; //记录结束的状态
		this.width = null;
		this.height = null;
		this.fR = BindAsEventListener(this, this.resize); /*拖拽去更改div的大小*/
		this.fS = Bind(this, this.stop); /*停止移除监听的事件*/
		let initPos = {
			w: parseInt(CurrentStyle(this.obj).width),
			h: parseInt(CurrentStyle(this.obj).height),
			x: parseInt(CurrentStyle(this.obj).left),
			y: parseInt(CurrentStyle(this.obj).top)
		};
		framePos.push(initPos);
	},
	set: function(elm, direction) {
		if (!elm) return;
		this.resizeelm = elm;
		/*点击事件的监听,调用start函数去初始化数据,监听mousemove和mouseup,这两个事件,当mouseover的时候,去更改div的大小,当mouseup,去清除之前监听的两个事件*/
		addListener(this.resizeelm, 'mousedown', BindAsEventListener(this, this.start, this[direction]));
		return this;
	},
	start: function(e, fun) {
		this.fun = fun;
		this.original = [
			parseInt(CurrentStyle(this.obj).width),
			parseInt(CurrentStyle(this.obj).height),
			parseInt(CurrentStyle(this.obj).left),
			parseInt(CurrentStyle(this.obj).top)
		];
		this.width = (this.original[2] || 0) + this.original[0];
		this.height = (this.original[3] || 0) + this.original[1];
		addListener(document, 'mousemove', this.fR);
		addListener(document, 'mouseup', this.fS);
	},
	resize: function(e) {
		this.fun(e);
		/*失去焦点的时候,调用this.stop去清除监听事件*/
		if (Sys.IE) {
			this.resizeelm.onlosecapture = function() {
				this.fS();
			};
		} else {
			this.resizeelm.onblur = function() {
				this.fS();
			};
		}
	},
	stop: function() {
		removeListener(document, 'mousemove', this.fR);
		removeListener(document, 'mousemove', this.fS);
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); /**清除选中的内容*/
		//获取结束时的位置
		this.finial = [
			parseInt(CurrentStyle(this.obj).width),
			parseInt(CurrentStyle(this.obj).height),
			parseInt(CurrentStyle(this.obj).left),
			parseInt(CurrentStyle(this.obj).top)
		];
		//更新框框的位置
		let arr = this.obj.id.split('-');
		let index = parseInt(arr[arr.length - 1]);
		updateFramePos(this.finial, index - 1);
	},
	up: function(e) {
		// 限制拖拽区域
		if (e.clientY >= ME.frameArea[0] && e.clientY < ME.frameArea[1]) {
			if (this.height > e.clientY) {
				Css(this.obj, {
					top: `${e.clientY}px`,
					height: `${this.height - e.clientY}px`
				});
			} else {
				this.turnDown(e);
			}
		}
	},
	down: function(e) {
		// 限制拖拽区域
		if (e.clientY >= ME.frameArea[0] && e.clientY < ME.frameArea[1]) {
			if (e.clientY > this.original[3]) {
				Css(this.obj, {
					top: `${this.original[3]}px`,
					height: `${e.clientY - this.original[3]}px`
				});
			} else {
				this.turnUp(e);
			}
		}
	},
	left: function(e) {
		// 限制拖拽区域
		if (e.clientX >= ME.frameArea[2] && e.clientX <= ME.frameArea[3]) {
			if (e.clientX < this.width) {
				Css(this.obj, {
					left: `${e.clientX}px`,
					width: `${this.width - e.clientX}px`
				});
			} else {
				this.turnRight(e);
			}
		}
	},
	right: function(e) {
		// 限制拖拽区域
		if (e.clientX >= ME.frameArea[2] && e.clientX <= ME.frameArea[3]) {
			if (e.clientX > this.original[2]) {
				Css(this.obj, {
					left: `${this.original[2]}px`,
					width: `${e.clientX - this.original[2]}px`
				});
			} else {
				this.turnLeft(e);
			}
		}
	},
	leftUp: function(e) {
		this.up(e);
		this.left(e);
	},
	leftDown: function(e) {
		this.left(e);
		this.down(e);
	},
	rightUp: function(e) {
		this.up(e);
		this.right(e);
	},
	rightDown: function(e) {
		this.right(e);
		this.down(e);
	},
	turnDown: function(e) {
		Css(this.obj, {
			top: `${this.height}px`,
			height: `${e.clientY - this.height}px`
		});
	},
	turnUp: function(e) {
		Css(this.obj, {
			top: `${e.clientY}px`,
			height: `${this.original[3] - e.clientY}px`
		});
	},
	turnRight: function(e) {
		Css(this.obj, {
			left: `${this.width}px`,
			width: `${e.clientX - this.width}px`
		});
	},
	turnLeft: function(e) {
		Css(this.obj, {
			left: `${e.clientX}px`,
			width: `${this.original[2] - e.clientX}px`
		});
	}
});

let ResizeTop = new Class({
	initPos: {},
	initialize: function(obj) {
		this.obj = obj;
		this.resizeelm = null;
		this.fun = null; //记录触发什么事件的索引
		this.original = []; //记录开始状态的数组
		this.fR = BindAsEventListener(this, this.resize); /*拖拽去更改div的大小*/
		this.fS = Bind(this, this.stop); /*停止移除监听的事件*/

		this.initPos = {
			top: parseInt(CurrentStyle(this.obj).top)
		};
		ME.EndingLocation[Number(this.obj.getAttribute('index')) - 1] = {
			y: this.initPos.top
		};
	},
	set: function(elm, direction) {
		if (!elm) return;
		this.resizeelm = elm;
		/*点击事件的监听,调用start函数去初始化数据,监听mousemove和mouseup,这两个事件,当mouseover的时候,去更改div的大小,当mouseup,去清除之前监听的两个事件*/
		addListener(this.resizeelm, 'mousedown', BindAsEventListener(this, this.start, this[direction]));
		return this;
	},
	start: function(e, fun) {
		this.fun = fun;
		this.original = [parseInt(CurrentStyle(this.obj).top)];
		addListener(document, 'mousemove', this.fR);
		addListener(document, 'mouseup', this.fS);
	},
	resize: function(e) {
		this.fun(e);
		/*失去焦点的时候,调用this.stop去清除监听事件*/
		if (Sys.IE) {
			this.resizeelm.onlosecapture = function() {
				this.fS();
			};
		} else {
			this.resizeelm.onblur = function() {
				this.fS();
			};
		}
	},
	stop: function() {
		removeListener(document, 'mousemove', this.fR);
		removeListener(document, 'mousemove', this.fS);
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); /**清除选中的内容*/

		let nowTop = parseInt(CurrentStyle(this.obj).top);
		if (this.initPos.top !== nowTop) {
			ME.EndingLocation[Number(this.obj.getAttribute('index')) - 1] = {
				y: nowTop
			};
		}
	},
	up: function(e) {
		if (e.clientY >= ME.frameArea[0] && e.clientY < ME.frameArea[1]) {
			let objArr = document.getElementsByClassName(this.obj.className);
			for (let i = 0; i < objArr.length; i++) {
				Css(objArr[i], {
					top: `${e.clientY}px`
				});
			}
		}
	}
});

/**
 * @description 更新红框信息到服务器
 * @param {*} arr 结束后红框的位置信息
 * @param {*} index 拖拽的是第几个红框
 */
export function updateFramePos(arr, index) {
	console.log('updateFramePos', arr, ME.FrameLocation);
	//如果红框的数据没有变化则不请求接口
	let pos = framePos[index];
	if (pos.w == arr[0] && pos.h == arr[1] && pos.x == arr[2] && pos.y == arr[3]) {
		return;
	}
	framePos[index] = {
		w: arr[0],
		h: arr[1],
		x: arr[2],
		y: arr[3]
	};
	ME.FrameLocation = framePos;
	console.log('updateFramePos', arr, ME.FrameLocation);
}

/**
 * @description 创建拖拽dom元素
 * @param {*} suffix id后缀
 * @param {*} qid 题目编号
 */
export function createDragDivs(suffix, qid) {
	let str =
		`<div id='rRightDown${suffix}' class='rRightDown'></div> ` +
		`<div id='rLeftDown${suffix}' class='rLeftDown'></div>` +
		`<div id='rRightUp${suffix}' class='rRightUp'></div>` +
		`<div id='rLeftUp${suffix}' class='rLeftUp'></div>` +
		`<div id='rRight${suffix}' class='rRight'></div>` +
		`<div id='rLeft${suffix}' class='rLeft'></div>` +
		`<div id='rUp${suffix}' class='rUp'></div>` +
		`<div id='rDown${suffix}' class='rDown'></div>`;
	return str;
}

/**
 *
 * @param {*} domid 元素id
 * @param {*} suffix id后缀
 */
export function initDragDiv(domid, suffix, self) {
	new Resize(dom(domid + suffix))
		.set(dom(`rUp${suffix}`), 'up')
		.set(dom(`rDown${suffix}`), 'down')
		.set(dom(`rLeft${suffix}`), 'left')
		.set(dom(`rRight${suffix}`), 'right')
		.set(dom(`rLeftUp${suffix}`), 'leftUp')
		.set(dom(`rLeftDown${suffix}`), 'leftDown')
		.set(dom(`rRightDown${suffix}`), 'rightDown')
		.set(dom(`rRightUp${suffix}`), 'rightUp');
}
export function initDragEnd(domid, suffix, self) {
	new ResizeTop(dom(domid + suffix)).set(dom(`endingUp${suffix}`), 'up');
}
