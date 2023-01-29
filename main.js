const gameEngine = new GameEngine();
const newRow = new NewRow();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	// gameEngine.init(ctx);

	// gameEngine.start();

	newRow.init(ctx);
	newRow.draw(ctx);
	
});
