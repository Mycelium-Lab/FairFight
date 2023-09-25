// author: Willie Lawrence
// contact: cptx032 arroba gmail dot com
// based in https://github.com/jeromeetienne/virtualjoystick.js/blob/master/virtualjoystick.js

const gameAction = document.querySelector('#game-action')

var JOYSTICK_DIV = null;
var div_style = null
function __init_joystick_div()

{
	JOYSTICK_DIV = document.createElement('div');
    JOYSTICK_DIV.className = 'joystick'
	div_style = JOYSTICK_DIV.style;
	div_style.background = 'rgba(255,255,255,0)';
	div_style.position = 'relative';
	div_style.top = '0px';
	div_style.bottom = '0px';
	div_style.left = '0px';
	div_style.right = '0px';
	div_style.margin = '0px';
	div_style.padding = '0px';
	div_style.borderWidth = '0px';
	div_style.zIndex = '200';
	gameAction.appendChild( JOYSTICK_DIV );
}
export var JoyStick = function( attrs ) {
	this.radius = attrs.radius || 50;
	this.inner_radius = attrs.inner_radius || this.radius / 2;
	this.x = attrs.x || 0;
	this.y = attrs.y || 0;
	this.mouse_support = attrs.mouse_support;
    this.maxOffsetX = this.radius / 2; // Максимальное смещение по горизонтали
    this.maxOffsetY = this.radius / 2; // Максимальное смещение по вертикали


	if ( attrs.visible === undefined )
	{
		attrs.visible = true;
	}

	if ( attrs.visible )
	{
		this.__create_fullscreen_div();
	}
};

JoyStick.prototype.left = false;
JoyStick.prototype.right = false;
JoyStick.prototype.up = false;
JoyStick.prototype.down = false;

JoyStick.prototype.__is_up = function ( dx, dy )
{
	if( dy >= 0 )
	{
		return false;
	}
	if( Math.abs(dx) > 2*Math.abs(dy) )
	{
		return false;
	}
	return true;
};

JoyStick.prototype.__is_down = function down( dx, dy )
{
	if( dy <= 0 )
	{
		return false;
	}
	if( Math.abs(dx) > 2*Math.abs(dy) )
	{
		return false;
	}
	return true;	
};

JoyStick.prototype.__is_left = function( dx, dy )
{
	if( dx >= 0 )
	{
		return false;
	}
	if( Math.abs(dy) > 2*Math.abs(dx) )
	{
		return false;
	}
	return true;	
};

JoyStick.prototype.__is_right = function( dx, dy )
{
	if( dx <= 0 )
	{
		return false;
	}
	if( Math.abs(dy) > 2*Math.abs(dx) )
	{
		return false;
	}
	return true;	
};

JoyStick.prototype.__create_fullscreen_div = function()
{
	if ( JOYSTICK_DIV === null )
	{
		__init_joystick_div();
	}
	this.div = JOYSTICK_DIV;
	///////////////////////////////////////////
	this.base = document.createElement('span');
	this.base.id = 'joystick-base'
	div_style = this.base.style;
	div_style.width = this.radius * 2.5 + 'px';
	div_style.height = this.radius * 2.5 + 'px';
	div_style.position = 'absolute';
	div_style.top = this.y - this.radius + 'px';
	JOYSTICK_DIV.style.top = '-' + div_style.top
	div_style.left = this.x - this.radius + 'px';
	JOYSTICK_DIV.style.left = '-' + div_style.left
	div_style.borderRadius = '50%';
	div_style.borderColor = 'rgba(255,124,6,0.3)';
	div_style.backgroundColor = 'rgba(255,255,255,0.3)';
	div_style.borderWidth = '4px';
	div_style.borderStyle = 'solid';
	this.div.appendChild( this.base );
	///////////////////////////////////////////
	this.control = document.createElement('span');
	this.control.id = 'joystick-control'
	div_style = this.control.style;
	div_style.width = this.inner_radius * 2.9 + 'px';
	div_style.height = this.inner_radius * 2.9 + 'px';
	div_style.position = 'absolute';
	div_style.top = this.y - this.inner_radius + 'px';
	div_style.left = this.x - this.inner_radius + 'px';
	div_style.borderRadius = '50%';
	div_style.backgroundColor = 'rgba(255,255,255,0.3)';
	div_style.borderWidth = '3px';
	div_style.borderColor = 'rgba(255,124,6,0.3)';
	div_style.borderStyle = 'solid';
	this.div.appendChild( this.control );
	///////////////////////////////////////////
	var self = this;
	// the event is binded in all the screen
	// to captures fast movements
	function touch_hander( evt )
	{
        evt.preventDefault()
		var touch_obj = evt.changedTouches ? evt.changedTouches[0] : evt;
		if ( self.mouse_support && !(touch_obj.buttons === 1) )
		{
			return;
		}
        
        // Вычисляем смещения по горизонтали и вертикали
		const joystickBase = document.getElementById('joystick-base').getBoundingClientRect()
		const joystickBaseX = joystickBase.x + 40
		const joystickBaseY = joystickBase.y + 40
        var offsetX = touch_obj.clientX - joystickBaseX;
        var offsetY = touch_obj.clientY - joystickBaseY;
		// console.log('+++++++++++++++++++++++++++++++++++++++++++')
		// console.log(`OBJ: ${touch_obj.clientX}`, `SELF: ${self.x}`, `BASE: ${joystickBaseX}`)
		// console.log(`OBJ: ${touch_obj.clientY}`, `SELF: ${self.y}`, `BASE: ${joystickBaseY}`)
        // Ограничиваем смещения
        offsetX = Math.max(-self.maxOffsetX, Math.min(self.maxOffsetX, offsetX));
        offsetY = Math.max(-self.maxOffsetY, Math.min(self.maxOffsetY, offsetY));
		self.control.style.left = self.x - self.inner_radius + offsetX + 'px';
        self.control.style.top = self.y - self.inner_radius + offsetY + 'px';
		// self.control.style.left = touch_obj.clientX - self.inner_radius + 'px';
		// self.control.style.top = touch_obj.clientY - self.inner_radius + 'px';
		// console.log('---------------------------------------------')

		var dx = touch_obj.clientX - joystickBaseX;
		var dy = touch_obj.clientY - joystickBaseY;
		// console.log('is up:', self.__is_up( dx, dy ))
		// console.log('is down:', self.__is_down( dx, dy ))
		// console.log('is left:', self.__is_left( dx, dy ))
		// console.log('is right:', self.__is_right( dx, dy ))
		self.up = self.__is_up( dx, dy );
		self.down = self.__is_down( dx, dy );
		self.left = self.__is_left( dx, dy );
		self.right = self.__is_right( dx, dy );
	}
	function clear_flags()
	{
		self.left = false;
		self.right = false;
		self.up = false;
		self.down = false;

		self.control.style.top = self.y - self.inner_radius + 'px';
		self.control.style.left = self.x - self.inner_radius + 'px';
	}
	this.bind( 'touchmove', touch_hander );
	this.bind( 'touchstart', touch_hander );
	this.bind( 'touchend', clear_flags );
	if ( this.mouse_support )
	{
		this.bind( 'mousedown', touch_hander );
		this.bind( 'mousemove', touch_hander );
		this.bind( 'mouseup', clear_flags );
	}
};
JoyStick.prototype.bind = function( evt, func )
{
	this.base.addEventListener( evt, func );
	this.control.addEventListener( evt, func );
};

/*
attributes:
	+ x
	+ y
	+ func
	+ mouse_support
*/
var JoyStickButton = function( attrs )
{
	this.radius = attrs.radius || 50;
	this.x = attrs.x || 0;
	this.y = attrs.y || 0;
	this.text = attrs.text||'';
	this.mouse_support = attrs.mouse_support||false;
	if ( JOYSTICK_DIV === null )
	{
		__init_joystick_div();
	}
	this.base = document.createElement('span');
	this.base.innerHTML = this.text;
	div_style = this.base.style;
	div_style.width = this.radius * 2.5 + 'px';
	div_style.height = this.radius * 2.5 + 'px';
	div_style.position = 'absolute';
	div_style.top = this.y - this.radius + 'px';
	div_style.left = this.x - this.radius + 'px';
	div_style.borderRadius = '50%';
	div_style.backgroundColor = '#ff7c06';
	div_style.borderWidth = '1px';
	div_style.borderColor = 'rgba(255,255,255,0.8)';
	div_style.borderStyle = 'solid';
	JOYSTICK_DIV.appendChild( this.base );

	if ( attrs.func )
	{
		if ( this.mouse_support )
		{
			this.bind( 'mousedown', attrs.func );
		}
		this.bind( 'touchstart', attrs.func );
	}

	var self = this;
	function __over()
	{
		div_style.backgroundColor = '#ff7c06';
	}
	function __leave()
	{
		div_style.backgroundColor = '#ff7c06';
	}
	self.bind( 'touchstart', __over );
	self.bind( 'touchend', __leave );
	if ( this.mouse_support )
	{
		self.bind( 'mousedown', __over );
		self.bind( 'mouseup', __leave );
	}
};
JoyStickButton.prototype.bind = function( evt, func )
{
	this.base.addEventListener( evt, func );
};