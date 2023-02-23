const gameEngine = new GameEngine();
// const gameDisplay = new GameDisplay();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);
	gameEngine.start();

	
	// gameDisplay.init(ctx);
	// for (let i = 0; i < 10; i++) {
	// 	gameDisplay.update();
	// 	console.log(gameDisplay.state);
	// }

});