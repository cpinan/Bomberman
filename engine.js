// Request Animation Frame
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var time = new Date().getTime();

var KEY_STATES = { UP: false, DOWN: false, LEFT: false, RIGHT: false, SPACE: false };

document.onkeydown = function(event)
{
	event = event || window.event;
	var char_code = event.keyCode || event.which;

	if(char_code == "38")
		KEY_STATES.UP = true;

	if(char_code == "37")
		KEY_STATES.LEFT = true;

	if(char_code == "39")
		KEY_STATES.RIGHT = true;

	if(char_code == "40")
		KEY_STATES.DOWN = true;

	if(char_code == "32")
		KEY_STATES.SPACE = true;

};

document.onkeyup = function(event)
{
	event = event || window.event;
	var char_code = event.keyCode || event.which;

	if(char_code == "38")
		KEY_STATES.UP = false;

	if(char_code == "37")
		KEY_STATES.LEFT = false;

	if(char_code == "39")
		KEY_STATES.RIGHT = false;

	if(char_code == "40")
		KEY_STATES.DOWN = false;

	if(char_code == "32")
		KEY_STATES.SPACE = false;

};