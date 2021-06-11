jewel.screens["splash-screen"] = (function() {
    var firstRun = true;

    function setup() {
        jewel.dom.bind("#splash-screen", "click", function() {
            jewel.showScreen("main-menu");
            console.log("bind click");
        });
    }

    function run() {
        if(firstRun) {
            setup();
            firstRun = false;
        }
    }

    return {
        run: run
    };
})();