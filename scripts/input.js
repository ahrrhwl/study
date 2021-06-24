jewel.input = (function() {
    var gpStates,
        gpPoller,
        inputHandlers;

    var keys = {
        37 : "KEY_LEFT",
        38 : "KEY_UP",
        39 : "KEY_RIGHT",
        40 : "KEY_DOWN",
        13 : "KEY_ENTER",
        32 : "KEY_SPACE",
        65 : "KEY_A",
        66 : "KEY_B",
        67 : "KEY_C",
        // alpha keys 68 - 87
        88 : "KEY_X",
        89 : "KEY_Y",
        90 : "KEY_Z"
    }; 

    function initialize() {
        var dom = jewel.dom,
            $ = dom.$,
            controls = jewel.settings.controls,
            board = $("#game-screen .game-board")[0];

        inputHandlers = {};
        dom.bind(board, "mousedown", function(event) {
            handleClick(event, "CLICK", event);
        });
        dom.bind(board, "touchstart", function(event) {
            handleClick(event, "TOUCH", event.targetTouches[0]);
        });
        dom.bind(document, "keydown", function(event) {
            var keyName = keys[event.keyCode];
            if (keyName && controls[keyName]) {
                trigger(controls[keyName]);
                event.preventDefault();
            }
        });

        if(getGamepads()) {
            gpStates = [];
            if (!gpPoller) {
                gpPoller = setInterval(pollGamepads, 1000/60);
                // workaround to make Firefox register gamepads
                window.addEventListener("gamepadconnected", function(){}, false);
            }
        }
    }

    function getGamepads() {
        if (navigator.gamepads) {
            return navigator.gamepads;
        } else if(navigator.getGamepads) {
            return navigator.getGamepads();
        } else if(navigator.webkitGetGamepads) {
            return navigator.webkitGetGamepads();
        }
    }

    function updateGameState(gamepad) {
        var state = gpStates[gamepad.index];
        for (var i = 0; i < gamepad.buttons.length; i++) {
            if (gamepad.buttons[i] != state.buttons[i]) {
                state.buttons[i] = gamepad.buttons[i];
                if (state.buttons[i]) {
                    gamepadButtonDown(gamepad, i);
                }
            }
        }
        
        for (var i = 0; i < gamepad.axes.length; i++) {
            if (gamepad.axes[i] != state.axes[i]) {
                state.axes[i] = gamepad.axes[i];
                gamepadAxisChange(gamepad, i, state.axes[i]);
            }
        }
    }

    function gamepadButtonDown(gamepad, buttonIndex) {
        var gpButtons = {0: "BUTTON_A"}, 
            controls = jewel.settings.controls,
            button = gpButtons[buttonIndex];
        
        if (button && controls[button]) {
            trigger(control[button]);
        }
    }

    function gamepadAxisChange(gamepad, axisIndex, axisValue) {
        var controls = jewel.settings.controls, 
            controlName;

        if (axisIndex === 0 && axisValue === -1) {
            controlName = "LEFT_STICK_LEFT";
        } else if (axisIndex === 0 && axisValue === 1) {
            controlName = "LEFT_STICK_RIGHT";
        } else if (axisINdex === 1 && axisValue === -1) {
            controlName = "LEFT_STICK_UP";
        } else if (axisIndex === 1 && axisValue === 1) {
            controlName = "LEFT_STICK_DOWN";
        }

        if (controlName && controls[controlName]) {
            trigger(controls[controlName]);
        }
    }

    function pollGamepads() {}
    function gamepadConnected() {}
    function gamepadDisconnected() {}

    function updateGamepadState(gamepad) {
        var state = gpStates[gamepad.index];
        for (var i=0; i < gamepad.buttons.length; i++) {

        }
    }

    function handleClick(event, control, click) {
        // is any action bound to this input control?
        var settings = jewel.settings,
            action = settings.controls[control];

        if(!action) {
            return;
        }

        var board = jewel.dom.$("#game-screen .game-board")[0],
            rect = board.getBoundingClientRect(), 
            relX, relY,
            jewelX, jewelY;

        // click position relative to board
        relX = click.clientX - rect.left;
        relY = click.clientY - rect.top;
        // jewel coordinates
        jewelX = Math.floor(relX / rect.width * settings.cols);
        jewelY = Math.floor(relY / rect.height * settings.rows);
        // trigger functions bound to action
        trigger(action, jewelX, jewelY);
        // prevent default click behavior
        event.preventDefault();
    }

    function bind(action, handler) {
        if (!inputHandlers[action]) {
            inputHandlers[action] = [];
        }
        inputHandlers[action].push(handler);
    }

    function trigger(action) {
        var handlers = inputHandlers[action], 
            args = Array.prototype.slice.call(arguments, 1);

        console.log("Game action: " + action);
        if(handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].apply(null, args);
            }
        }
    }

    return {
        initialize: initialize,
        bind: bind
    };
})();