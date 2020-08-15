
// assets for loadscreen
var loadscreenAssets = {
	graphics: {
		background: 'gfx/background.png',
		title: 'gfx/title.png',
		progressbg: 'gfx/progressbg.png',
		progressbar: 'gfx/progressbar.png',
		startbutton: 'gfx/startbutton.png',
		checkbox: 'gfx/checkbox.png',
		labelsoundeffects: 'gfx/labelsoundeffects.png',
		labelfullscreen: 'gfx/labelfullscreen.png'
	}
};

// game assets
var gameAssets = {
	graphics: {
		topicons: 'gfx/topicons.png',
		menudrawer: 'gfx/menudrawer.png',
		menubackground: 'gfx/menubackground.png',
		menubuttons: 'gfx/menubuttons.png',
		levelprogressbg: 'gfx/levelprogressbg.png',
		lockicon: 'gfx/lockicon.png',
		vertex: 'gfx/vertex.png',
		taphl: 'gfx/taphl.png',
		digits: 'gfx/digits.png',
		minivertex: 'gfx/minivertex.png',
		tutorial1: 'gfx/tutorial1.png',
		tutorial2: 'gfx/tutorial2.png',
		tutorial3: 'gfx/tutorial3.png',
		tutorial4: 'gfx/tutorial4.png',
		arrow: 'gfx/arrow.png'
	},
	data: {
		levels: 'data/levels.json',
		user: 'data/user.json'
	},
	sfx: {
		pick: ['sfx/pick.mp3'],
		drop: ['sfx/drop.mp3'],
		victory: ['sfx/victory.mp3'],
		intro: ['sfx/intro.mp3']
	}
};

//
//  asset loader
//
var t_assetLoader = new ooze.AssetLoader();

t_assetLoader.handler.sfx = function(filenames, ready) {
	var sfx = new Howl({
		src: filenames,
		autoplay: false,
		loop: false,
		volume: 1,
		onload: function() {
			ready(sfx);
		},
		onloaderror: ready
	});
};

//
//  configuration
//
var t_defaultConfig = {
	sound: true,
	unlocked: 0
};
var t_config = new ooze.Configuration('Tronix2_cfg', t_defaultConfig);

/////////////////////////////////////////////////////////////////////
//
//  loadscreen state
//
/////////////////////////////////////////////////////////////////////

var t_loadscreenState = new ooze.State();

t_loadscreenState.init = function() {
	var self = this;

	this.gfx = t_assetLoader.from('graphics').get(
		'title',
		'progressbg',
		'progressbar',
		'startbutton',
		'checkbox',
		'labelfullscreen',
		'labelsoundeffects'
	);

	this.lockInput = true;
	this.lockOptions = true;

	this.titleY = 550;
	this.titleOpacity = 0;
	this.progressbarOpacity = 0;
	this.startbuttonOpacity = 0;
	this.startbuttonPressed = false;
	this.startbuttonActive = false;
	this.optionsOpacity = 0;
	this.proceeding = false;

	this.optionSoundEffects = t_config.sound;
	this.optionFullscreen = false;

	this.chkboxSoundEffectsRect = [172, 1031, 420, 60];
	this.chkboxSoundEffectsPressed = false;
	this.chkboxSoundEffectsActive = false;

	this.chkboxFullscreenRect = [172, 1125, 420, 60];
	this.chkboxFullscreenPressed = false;
	this.chkboxFullscreenActive = false;

	this.progress = 0;

	// intro tweens
	var animTime = 500;
	this.twIntro1 = new ooze.Tween(550, 540, animTime, function(value) {
		self.titleY = value;
	}, null, ooze.ease.quadInOut);

	this.twIntro2 = new ooze.Tween(0, 1, animTime, function(value) {
		self.titleOpacity = value;
		self.progressbarOpacity = value;
	}, null, ooze.ease.linear);

	// show options tween
	this.twShowOptions = new ooze.Tween(0, 1, 250, function(value) {
		self.optionsOpacity = value;
	}, function() {
		self.lockOptions = false;
	}, ooze.ease.linear)

	this.registerEvents();
};

t_loadscreenState.registerEvents = function() {
	var self = this;

	// register play button events
	function coordsInPlayButton(coords) {
		return ooze.pointInCircle(coords[0], coords[1], 365, 676, 139);
	}
	t_input.on('press', function(coords) {
		if (self.lockInput) {
			return;
		}
		if (coordsInPlayButton(coords)) {
			self.startbuttonPressed = self.startbuttonActive = true;
		}
	}).bindTo(this);

	t_input.on('move', function(coords) {
		if (self.lockInput) {
			return;
		}
		if (self.startbuttonActive) {
			self.startbuttonPressed = coordsInPlayButton(coords);
		}
	}).bindTo(this);

	t_input.on('release', function() {
		if (self.lockInput) {
			return;
		}
		if (self.startbuttonPressed) {
			self.lockInput = true;
			self.proceed();
		}
		self.startbuttonPressed = self.startbuttonActive = false;
	}).bindTo(this);

	// register checkbox events
	function coordsInCheckbox(rect, coords) {
		return ooze.pointInRect(coords[0], coords[1], rect[0], rect[1], rect[2], rect[3]);
	}
	t_input.on('press', function(coords) {
		if (self.lockInput || self.lockOptions) {
			return;
		}
		if (coordsInCheckbox(self.chkboxSoundEffectsRect, coords)) {
			self.chkboxSoundEffectsPressed = self.chkboxSoundEffectsActive = true;
		}
		else if (coordsInCheckbox(self.chkboxFullscreenRect, coords)) {
			self.chkboxFullscreenPressed = self.chkboxFullscreenActive = true;
		}
	}).bindTo(this);
	t_input.on('move', function(coords) {
		if (self.lockInput || self.lockOptions) {
			return;
		}
		if (self.chkboxSoundEffectsActive) {
			self.chkboxSoundEffectsPressed = coordsInCheckbox(self.chkboxSoundEffectsRect, coords);
		}
		if (self.chkboxFullscreenActive) {
			self.chkboxFullscreenPressed = coordsInCheckbox(self.chkboxFullscreenRect, coords);
		}
	}).bindTo(this);
	t_input.on('release', function(coords) {
		if (self.lockInput || self.lockOptions) {
			return;
		}
		if (self.chkboxSoundEffectsPressed) {
			self.optionSoundEffects = !self.optionSoundEffects;
		}
		else if (self.chkboxFullscreenPressed) {
			self.optionFullscreen = !self.optionFullscreen;
		}
		self.chkboxSoundEffectsPressed = self.chkboxSoundEffectsActive = false;
		self.chkboxFullscreenPressed = self.chkboxFullscreenActive = false;
	}).bindTo(this);
};

t_loadscreenState.draw = function() {
	this.surface.clear();

	this.paint.setAlpha(this.titleOpacity);
		this.paint.graphics(this.gfx.title, 210, this.titleY);

	this.paint.setAlpha(this.progressbarOpacity);
		this.paint.graphics(this.gfx.progressbg, 212, 663);
		this.paint.tile(this.gfx.progressbar, 214, 665, 5, 20, 0, 0);
		var progBarWidth = 286 * this.progress;
		this.paint.rectFill(219, 665, progBarWidth, 20, '#f29334');
		this.paint.tile(this.gfx.progressbar, 219 + progBarWidth, 665, 5, 20, 5, 0);

	this.paint.setAlpha(this.startbuttonOpacity);
		this.paint.tile(this.gfx.startbutton, 227, 540, 278, 278, (this.startbuttonPressed) ? 278 : 0, 0);

	this.paint.setAlpha(this.optionsOpacity);
		this.paint.tile(this.gfx.checkbox, 172, 1031, 60, 60, this.optionSoundEffects ? 60 : 0, this.chkboxSoundEffectsPressed ? 60 : 0);
		this.paint.tile(this.gfx.checkbox, 172, 1125, 60, 60, this.optionFullscreen ? 60 : 0, this.chkboxFullscreenPressed ? 60 : 0);
		this.paint.tile(this.gfx.labelsoundeffects, 270, 1044, 290, 31, 0, this.chkboxSoundEffectsPressed ? 31 : 0);
		this.paint.tile(this.gfx.labelfullscreen, 270, 1138, 220, 31, 0, this.chkboxFullscreenPressed ? 31 : 0);

	this.paint.setAlpha();
};

t_loadscreenState.enter = function() {
	this.twIntro1.start();
	this.twIntro2.start();
};

t_loadscreenState.exit = function() {
};

t_loadscreenState.trackProgress = function(items, n_items) {
	t_loadscreenState.progress = items / n_items;
};

t_loadscreenState.showMenu = function() {
	var self = this;
	// if we loaded fast enough, we have to finish the intro tweens
	this.twIntro1.finish();
	this.twIntro2.finish();

	// show loadscreen menu
	(new ooze.Tween(1, 0, 500, function(value) {
		self.progressbarOpacity = value;
	}, null, ooze.ease.linear)).start();

	(new ooze.Tween(540, 320, 700, function(value) {
		self.titleY = value;
	}, function() {

		(new ooze.Tween(0, 1, 250, function(value) {
			self.startbuttonOpacity = value;
		}, function() {
			self.lockInput = false;

			setTimeout(function() {
				if (!self.proceeding) {
					self.twShowOptions.start();
				}
			}, 250);

		}, ooze.ease.linear)).start();

	}, ooze.ease.quadInOut)).start();
};

t_loadscreenState.proceed = function() {
	var self = this;
	this.proceeding = true;
	// apply options
	t_config.sound = this.optionSoundEffects;
	t_config.save();
	if (this.optionFullscreen) {
		if (screenfull.isEnabled) {
			screenfull.toggle();
		}
	}
	// proceed to game state
	this.twShowOptions.stop();
	(new ooze.Tween(self.optionsOpacity, 0, 500, function(value) {
		self.optionsOpacity = value;
	}, null, ooze.ease.linear)).start();
	(new ooze.Tween(1, 0, 500, function(value) {
		self.titleOpacity = self.startbuttonOpacity = value;
	}, function() {
		t_game.setState(t_gamescreenState);
	}, ooze.ease.linear)).start();
};

/////////////////////////////////////////////////////////////////////
//
//  game state
//
/////////////////////////////////////////////////////////////////////

var t_gamescreenState = new ooze.State();

//
//  button class
//
var Button = function(options) {
	var state = t_gamescreenState;
	var self = this;

	this.x = options.x || 0;
	this.y = options.y || 0;
	this.width = options.width || 50;
	this.height = options.height || 50;
	this.gfx = options.gfx;
	this.tileNormal = options.tileNormal || [0, 0];
	this.tilePressed = options.tilePressed || [0, 0];
	this.pushRepeat = options.pushRepeat || false;
	this.enabled = true;

	var pressed = false;
	var active = false;

	this.draw = function() {
		var tile = (pressed) ? self.tilePressed : self.tileNormal;
		state.paint.tile(self.gfx, self.x, self.y, self.width, self.height, tile[0], tile[1]);
	};

	function coordsInButton(coords) {
		return ooze.pointInRect(coords[0], coords[1], self.x, self.y, self.width, self.height);
	}

	var repeatTimeout = null;

	function repeatPush(seq) {
		seq = seq || 0;
		if (options.onPush instanceof Function) {
			options.onPush();
		}
		repeatTimeout = setTimeout(function() {
			repeatPush(Math.min(seq + 1, 20));
		}, (seq === 0) ? 400 : 120 - seq * 4);
	}

	t_input.on('press', function(coords) {
		if (!self.enabled) {
			return;
		}
		if (coordsInButton(coords)) {
			pressed = active = true;
			if (self.pushRepeat) {
				repeatPush();
			}
		}
	}).bindTo(state);

	t_input.on('move', function(coords) {
		if (!self.enabled) {
			return;
		}
		if (active) {
			pressed = coordsInButton(coords);
			if (!pressed) {
				clearTimeout(repeatTimeout);
				repeatTimeout = null;
			}
			else if (!repeatTimeout && self.pushRepeat) {
				repeatPush();
			}
		}
	}).bindTo(state);

	t_input.on('release', function(coords) {
		if (!self.enabled) {
			return;
		}
		if (pressed) {
			if (!self.pushRepeat && options.onPush instanceof Function) {
				options.onPush();
			}
			else {
				clearTimeout(repeatTimeout);
				repeatTimeout = null;
			}
		}
		pressed = active = false;
	}).bindTo(state);
};

//
//  icon pane
//
var IconPane = function() {
	var state = t_gamescreenState;
	var self = this;

	var gfxIcons = t_assetLoader.from('graphics').get('topicons');

	this.alpha = 0;

	var btnSoundEffects = new Button({
		x: 460,
		y: 30,
		width: 100,
		height: 100,
		gfx: gfxIcons,
		onPush: function() {
			t_config.sound = !t_config.sound;
			t_config.save();
			updateTilesSoundEffects();
		}
	});

	var btnFullscreen = new Button({
		x: 590,
		y: 30,
		width: 100,
		height: 100,
		gfx: gfxIcons,
		onPush: function() {
			if (screenfull.isEnabled) {
				screenfull.toggle();
			}
		}
	});

	var btnSoundEffectsTiles = {
		on: [[0, 0], [0, 100]],
		off: [[100, 0], [100, 100]]
	};
	var btnFullscreenTiles = {
		on: [[200, 0], [200, 100]],
		off: [[300, 0], [300, 100]]
	};

	function updateTilesSoundEffects() {
		btnSoundEffects.tileNormal = (t_config.sound) ? btnSoundEffectsTiles.on[0] : btnSoundEffectsTiles.off[0];
		btnSoundEffects.tilePressed = (t_config.sound) ? btnSoundEffectsTiles.on[1] : btnSoundEffectsTiles.off[1];
	}

	function updateTilesFullscreen() {
		var isFullscreen = screenfull.isFullscreen;
		btnFullscreen.tileNormal = (!isFullscreen) ? btnFullscreenTiles.on[0] : btnFullscreenTiles.off[0];
		btnFullscreen.tilePressed = (!isFullscreen) ? btnFullscreenTiles.on[1] : btnFullscreenTiles.off[1];
	}

	updateTilesSoundEffects();
	updateTilesFullscreen();

	// fullscreen event
	if (screenfull.isEnabled) {
		document.addEventListener(screenfull.raw.fullscreenchange, updateTilesFullscreen);
	}

	this.draw = function() {
		state.paint.setAlpha(self.alpha * 0.5);
			state.paint.rectFill(0, 0, 720, 160, '#121212');
			state.paint.rectFill(0, 160, 720, 3, '#444');
		state.paint.setAlpha(self.alpha);
			btnSoundEffects.draw();
			btnFullscreen.draw();
		state.paint.setAlpha();
	};

	this.enable = function() {
		btnSoundEffects.enabled = btnFullscreen.enabled = true;
	};

	this.disable = function() {
		btnSoundEffects.enabled = btnFullscreen.enabled = false;
	};
};

//
//  options pane
//
var OptionsPane = function(options) {
	var state = t_gamescreenState;
	var self = this;

	var gfx = t_assetLoader.from('graphics').get(
		'menudrawer',
		'menubackground',
		'levelprogressbg',
		'menubuttons',
		'lockicon',
		'digits',
		'minivertex'
	);

	var MAX_PULLHEIGHT = 310;

	this.alpha = 0;
	var pullHeight = 0;

	var drawerStateOpen = false;

	var digitFont = state.digitFont;

	var selectedLevel = 1;
	var maxLevel = state.nLevels;
	var levelProgress = 0;

	function updateLevelProgress() {
		levelProgress = selectedLevel / maxLevel;
	}

	var previewSurface = new ooze.Surface({
		width: 110,
		height: 190
	});

	function redrawPreview() {
		function translateCoords(point) {
			return [point[0] / 720 * 110, point[1] / 1280 * 190];
		}

		var level = state.levelData[selectedLevel - 1];
		var render = previewSurface.render;
		var V = level.V;
		var E = level.E;

		previewSurface.clear();
		render.setAlpha(0.7);

		// find min/max y vertex for centering
		var minY = 190, maxY = 0;
		var i = V.length;
		while (i--) {
			var vertex = V[i];
			var p = translateCoords(vertex);
			var py = p[1];
			if (py - 7 < minY) {
				minY = py - 7;
			}
			if (py + 7 > maxY) {
				maxY = py + 7;
			}
		}
		var offsetY = (190 - maxY - minY) / 2;

		i = E.length;
		while (i--) {
			var edge = E[i];
			var p1 = translateCoords(V[edge[0]]);
			var p2 = translateCoords(V[edge[1]]);
			render.line(p1[0], p1[1] + offsetY, p2[0], p2[1] + offsetY, state.colors.unsolved, 3);
		}

		render.setAlpha();

		i = V.length;
		while (i--) {
			var vertex = V[i];
			var p = translateCoords(vertex);
			render.graphics(gfx.minivertex, p[0] - 7, p[1] - 7 + offsetY);
		}
	}

	var btnPlay = new Button({
		x: 20,
		y: 1000,
		width: 150,
		height: 150,
		gfx: gfx.menubuttons,
		tileNormal: [0, 0],
		tilePressed: [0, 150],
		onPush: function() {
			// load or reload the level
			if (!state.debugMode && selectedLevel > t_config.unlocked) {
				return;
			}
			state.nextArrow.hide();
			state.loadLevel(selectedLevel);
			self.close();
			if (!state.debugMode) {
				if (selectedLevel === 1) {
					state.tutorialAt = 0;
					state.displayTutorial('tutorial1', 800);
				}
				else {
					state.hideTutorial();
				}
			}
		}
	});

	var btnPrev = new Button({
		x: 380,
		y: 1000,
		width: 150,
		height: 150,
		gfx: gfx.menubuttons,
		tileNormal: [150, 0],
		tilePressed: [150, 150],
		pushRepeat: true,
		onPush: function() {
			if (selectedLevel > 1) {
				selectedLevel--;
				updateLevelProgress();
				redrawPreview();
			}
		}
	});

	var btnNext = new Button({
		x: 550,
		y: 1000,
		width: 150,
		height: 150,
		gfx: gfx.menubuttons,
		tileNormal: [300, 0],
		tilePressed: [300, 150],
		pushRepeat: true,
		onPush: function() {
			if (selectedLevel < maxLevel) {
				selectedLevel++;
				updateLevelProgress();
				redrawPreview();
			}
		}
	});

	function getDrawerY() {
		return 1280 - 58 - pullHeight;
	}

	function moveMenu(height) {
		if (height > MAX_PULLHEIGHT) {
			height = MAX_PULLHEIGHT;
		}
		else if (height < 0) {
			height = 0;
		}
		pullHeight = height;
		btnPlay.y
			= btnNext.y
			= btnPrev.y
			= 1310 - height;
		var menuOpenedRatio = height / MAX_PULLHEIGHT;
		if (options && options.onMove instanceof Function) {
			options.onMove(menuOpenedRatio);
		}
	}

	function reportState() {
		if (pullHeight === 0) {
			if (options && options.onClose) {
				drawerStateOpen = false;
				options.onClose();
				self.disable();
			}
		}
		else if (pullHeight === MAX_PULLHEIGHT) {
			if (options && options.onOpen) {
				drawerStateOpen = true;
				options.onOpen();
				self.enable();
			}
		}
	}

	// drawer event
	var dragging = false;
	var dragYStart = 0;
	var pullHeightStart = 0;
	var lockDrawer = false;

	var twnDrawer = null;
	var timePress = 0;

	this.setLevel = function(levelNumber) {
		selectedLevel = levelNumber;
		updateLevelProgress();
		redrawPreview();
	};

	t_input.on('press', function(coords) {
		if (lockDrawer) {
			return;
		}
		var drawerY = getDrawerY();
		if (ooze.pointInRect(coords[0], coords[1], 0, drawerY, 720, 58)) {
			dragging = true;
			dragYStart = coords[1];
			pullHeightStart = pullHeight;
			if (!drawerStateOpen) {
				self.setLevel(state.currentLevel);
			}
			timePress = Date.now() / 1000;
		}
		else if (drawerStateOpen && ooze.pointInRect(coords[0], coords[1], 0, 180, 720, drawerY - 180)) {
			// close the menu
			self.close();
		}
	}).bindTo(state);

	t_input.on('move', function(coords) {
		if (lockDrawer) {
			return;
		}
		if (dragging) {
			var dragDiff = dragYStart - coords[1];
			moveMenu(pullHeightStart + dragDiff);
		}
	}).bindTo(state);

	t_input.on('release', function(coords) {
		if (lockDrawer) {
			return;
		}
		if (dragging) {
			dragging = false;
			if (twnDrawer) {
				twnDrawer.stop();
				twnDrawer = null;
			}
			if (pullHeight === MAX_PULLHEIGHT || pullHeight === 0) {
				var timeRelease = Date.now() / 1000 - timePress;
				if (timeRelease <= 0.25 && drawerStateOpen === false && pullHeight === 0) {
					self.open();
				}
				reportState();
				return;
			}
			var moveUp;
			if (!drawerStateOpen) {
				moveUp = pullHeight > (MAX_PULLHEIGHT / 5);
			}
			else {
				moveUp = pullHeight > (MAX_PULLHEIGHT - MAX_PULLHEIGHT / 10);
			}
			var moveFrom = pullHeight;
			var moveTo = (moveUp) ? MAX_PULLHEIGHT : 0;
			lockDrawer = true;
			twnDrawer = (new ooze.Tween(moveFrom, moveTo, 100, function(value) {
				moveMenu(value);
			}, function() {
				lockDrawer = false;
				twnDrawer = null;
				reportState();
			}, ooze.ease.quadInOut)).start();
		}
	}).bindTo(state);

	this.draw = function() {
		state.paint.setAlpha(self.alpha);
			// menu drawer
			state.paint.tile(gfx.menudrawer, 0, 1222 - pullHeight, 720, 58, 0, (dragging) ? 58 : 0);
			if (pullHeight > 0) {
				// menu backgrounds
				state.paint.graphics(gfx.menubackground, 0, 1280 - pullHeight);
				// menu buttons
				btnPlay.draw();
				btnPrev.draw();
				btnNext.draw();

				if (t_config.unlocked >= selectedLevel) {
					// graph preview
					state.paint.surface(previewSurface, 225, 1285 - pullHeight);
				}
				else {
					// locked icon
					state.paint.graphics(gfx.lockicon, 228, 1330 - pullHeight);
				}
				// level progress bar
				state.paint.graphics(gfx.levelprogressbg, 23, 1480 - pullHeight);
				state.paint.rectFill(25, 1482 - pullHeight, 669 * levelProgress, 18, state.colors.progress);
				// current level
				state.paint.bmptext(digitFont, selectedLevel + '/' + maxLevel, 360, 1528 - pullHeight, 0, 1);
			}

		state.paint.setAlpha();
	};

	this.enable = function() {
		btnPlay.enabled = btnPrev.enabled = btnNext.enabled = true;
	};

	this.disable = function() {
		btnPlay.enabled = btnPrev.enabled = btnNext.enabled = false;
	};

	this.lock = function() {
		lockDrawer = true;
	};

	this.unlock = function() {
		lockDrawer = false;
	};

	this.setPullHeight = function(value) {
		pullHeight = value;
	};

	this.setMaxPullHeight = function() {
		pullHeight = MAX_PULLHEIGHT;
	};

	this.open = function(tduration, done) {
		tduration = tduration || 200;
		if (twnDrawer) {
			twnDrawer.stop();
			twnDrawer = null;
		}
		lockDrawer = true;
		twnDrawer = (new ooze.Tween(0, MAX_PULLHEIGHT, tduration, function(value) {
			moveMenu(value);
		}, function() {
			lockDrawer = false;
			twnDrawer = null;
			reportState();
		}, ooze.ease.quadInOut)).start();
	};

	this.close = function(tduration, done) {
		tduration = tduration || 200;
		if (twnDrawer) {
			twnDrawer.stop();
			twnDrawer = null;
		}
		lockDrawer = true;
		twnDrawer = (new ooze.Tween(pullHeight, 0, tduration, function(value) {
			moveMenu(value);
		}, function() {
			lockDrawer = false;
			twnDrawer = null;
			reportState();
		}, ooze.ease.quadInOut)).start();
	};

	this.isOpen = function() {
		return drawerStateOpen;
	};
};

//
//  "next" arrow
//
var NextArrow = function(options) {
	var state = t_gamescreenState;
	var self = this;
	this.enabled = false;
	this.shown = false;

	var gfxArrow = t_assetLoader.from('graphics').get('arrow');

	var alpha = 0;
	var arrowX = 560;
	var arrowY = 1070;
	var arrowSize = 120;
	var animTilesX = Math.floor(gfxArrow.width / arrowSize);
	var animTilesY = Math.floor(gfxArrow.height / arrowSize);
	var animFrame = 0;
	var animFrameMax = animTilesX * animTilesY;

	var arrowTile = [0, 0];

	var xoffset = 0;

	function updateTile(tileIndex) {
		arrowTile = [
			(tileIndex % animTilesX) * arrowSize,
			Math.floor(tileIndex / animTilesX) * arrowSize
		];
	}

	var animIntvl = null;

	function runTileAnimation() {
		if (animIntvl) {
			clearInterval(animIntvl);
		}
		animFrame = 0;
		animIntvl = setInterval(function() {
			if (!self.enabled) {
				return;
			}
			animFrame++;
			if (animFrame >= animFrameMax) {
				animFrame = -20;
				updateTile(0);
			}
			if (animFrame >= 0) {
				updateTile(animFrame);
			}
		}, 50);
	}

	function stopTileAnimation() {
		if (animIntvl) {
			clearInterval(animIntvl);
			animIntvl = null;
		}
	}

	function updateXOffset(offset) {
		xoffset = offset;
	}

	var twnBobRight = new ooze.Tween(0, 10, 500, updateXOffset, function() {
		twnBobLeft.restart();
	}, ooze.ease.linear);

	var twnBobLeft = new ooze.Tween(10, 0, 500, updateXOffset, function() {
		twnBobRight.restart();
	}, ooze.ease.linear);

	function runBobAnimation() {
		xoffset = 0;
		twnBobRight.start();
	}

	function stopBobAnimation() {
		twnBobLeft.stop();
		twnBobRight.stop();
	}

	t_input.on('press', function(coords) {
		if (!self.enabled) {
			return;
		}
		if (ooze.pointInRect(coords[0], coords[1], arrowX, arrowY, arrowSize + 10, arrowSize)) {
			if (options.onPush instanceof Function) {
				options.onPush();
			}
		}
	}).bindTo(state);

	this.draw = function() {
		if (self.shown) {
			state.paint.setAlpha(alpha);
				state.paint.tile(gfxArrow, arrowX + xoffset, arrowY, arrowSize, arrowSize, arrowTile[0], arrowTile[1]);
			state.paint.setAlpha();
		}
	};

	this.show = function() {
		self.shown = true;
		(new ooze.Tween(0, 1, 250, function(value) {
			alpha = value;
		}, function() {
			self.enabled = true;
		}, ooze.ease.linear)).start();
		runTileAnimation();
		runBobAnimation();
	};

	this.hide = function(animate) {
		self.enabled = false;
		if (animate) {
			(new ooze.Tween(1, 0, 250, function(value) {
				alpha = value;
			}, function() {
				stopTileAnimation();
				stopBobAnimation();
				self.shown = false;
			}, ooze.ease.linear)).start();
		}
		else {
			stopTileAnimation();
			stopBobAnimation();
			self.shown = false;
		}
	};
};

//
//  game graph
//
var GameGraph = function(vertices, edges) {
	this.V = [];
	this.E = [];
	this.renderOrder = [];
	// deep copy level data
	var i;
	for (i = 0; i < vertices.length; i++) {
		this.V.push(vertices[i].slice());
		this.renderOrder.push(i);
	}
	for (i = 0; i < edges.length; i++) {
		this.E.push(edges[i].slice());
	}
};

t_gamescreenState.checkSolvedState = function() {

	// shorten a line segment by length d from each side
	function shortenLine(a, b, d) {
		var nextA = ooze.movePoint(a[0], a[1], b[0], b[1], d);
		var nextB = ooze.movePoint(b[0], b[1], a[0], a[1], d);
		a[0] = nextA[0];
		a[1] = nextA[1];
		b[0] = nextB[0];
		b[1] = nextB[1];
	};

	// check if graph is solved
	var V = this.graph.V;
	var E = this.graph.E;
	var i;
	// check line-to-line intersections
	for (i = 0; i < E.length - 1; i++) {
		for (var j = i + 1; j < E.length; j++) {
			var edge1 = E[i];
			var edge2 = E[j];
			var i1 = edge1[0];
			var i2 = edge1[1];
			var i3 = edge2[0];
			var i4 = edge2[1];
			var p0 = [V[i1][0], V[i1][1]];
			var p1 = [V[i2][0], V[i2][1]];
			var p2 = [V[i3][0], V[i3][1]];
			var p3 = [V[i4][0], V[i4][1]];
			shortenLine(p0, p1, 42);
			shortenLine(p2, p3, 42);
			if (ooze.linesIntersect(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], p3[0], p3[1])) {
				return false;
			}
		}
	}
	// check line-to-circle collisions
	for (i = 0; i < V.length; i++) {
		var vertex = V[i];
		for (var j = 0; j < E.length; j++) {
			var edge = E[j];
			if (edge[0] == i || edge[1] == i)
				continue;
			var p0 = [V[edge[0]][0], V[edge[0]][1]];
			var p1 = [V[edge[1]][0], V[edge[1]][1]];
			var v = [vertex[0], vertex[1]];
			if (ooze.pointToLineDistance(v[0], v[1], p0[0], p0[1], p1[0], p1[1]) < 42) // any less than 42 allows cheating
				return false;
		}
	}
	// passed all checks, graph is in solved state
	return true;
};

t_gamescreenState.loadLevel = function(levelNumber) {
	// load the game graph from level data
	this.currentLevel = levelNumber;
	if (levelNumber > t_config.unlocked) {
		t_config.unlocked = levelNumber;
		t_config.save();
	}
	this.solved = false;
	var level = this.levelData[this.currentLevel - 1];
	this.graph = new GameGraph(level.V, level.E);
	this.redrawGame();
	if (t_config.sound) {
		this.sfx.intro.play();
	}
};

t_gamescreenState.registerGameEvents = function() {
	var self = this;
	self.capturedVertex = null;
	var captureOffset = [0, 0];

	var hlAlphaTween = new ooze.Tween(0, 1, 150, function(value) {
		self.hlAlpha = value;
		self.redrawGame();
	}, null, ooze.ease.linear);

	t_input.on('press', function(coords) {
		if (self.lockGame) {
			return;
		}
		var V = self.graph.V;
		var renderOrder = self.graph.renderOrder;
		for (var i = 0; i < V.length; i++) {
			var j = renderOrder[i];
			var vertex = V[j];
			var vx = vertex[0] - 42;
			var vy = vertex[1] - 42;
			if (ooze.pointInCircle(coords[0], coords[1], vertex[0], vertex[1], 42)) {
				self.capturedVertex = vertex;
				self.capturedIndex = j;
				captureOffset[0] = coords[0] - vertex[0];
				captureOffset[1] = coords[1] - vertex[1];
				renderOrder.splice(renderOrder.indexOf(j), 1);
				renderOrder.unshift(j);
				hlAlphaTween.restart();
				if (t_config.sound) {
					self.sfx.pick.play();
				}
				break;
			}
		}
	}).bindTo(this);
	t_input.on('move', function(coords) {
		if (self.lockGame) {
			return;
		}
		if (self.capturedVertex) {
			var nextX = coords[0] - captureOffset[0];
			var nextY = coords[1] - captureOffset[1];
			if (nextX >= 42 && nextX <= 720 - 42) {
				self.capturedVertex[0] = nextX;
			}
			if (nextY >= 42 && nextY <= 1200 - 42) {
				self.capturedVertex[1] = nextY;
			}
			self.redrawGame();
		}
	}).bindTo(this);
	t_input.on('release', function(coords) {
		if (self.lockGame) {
			return;
		}
		if (self.capturedVertex) {
			self.capturedVertex = null;
			self.capturedIndex = -1;
			var wasSolved = self.solved;
			self.solved = self.checkSolvedState();
			self.redrawGame();
			var solvedFirst = !wasSolved && self.solved;
			if (solvedFirst && !self.nextArrow.shown && self.currentLevel < self.nLevels) {
				self.nextArrow.show();
			}
			if (t_config.sound) {
				if (solvedFirst) {
					self.sfx.victory.play();
				}
				self.sfx.drop.play();
			}
			if (!self.debugMode && self.solved) {
				// advance tutorial for levels 1 and 2
				if (self.currentLevel === 1 && self.tutorialAt === 0) {
					self.tutorialAt = 1;
					self.displayTutorial('tutorial2', 250);
				}
				else if (self.currentLevel === 2 && self.tutorialAt === 2) {
					self.tutorialAt = 3;
					self.displayTutorial('tutorial4', 250);
				}
			}
		}
	}).bindTo(this);
};

t_gamescreenState.redrawGame = function() {
	this.gameSurface.clear();
	var graph = this.graph;
	var V = graph.V, E = graph.E;
	var render = this.gameSurface.render;
	var capturedIndex = this.capturedIndex;
	var solved = this.solved;
	// draw edges
	var i = E.length;
	render.setAlpha(0.7);
	while(i--) {
		var edge = E[i];
		var posA = V[edge[0]];
		var posB = V[edge[1]];
		var lineColor;
		if (capturedIndex === edge[0] || capturedIndex === edge[1]) {
			lineColor = this.colors.highlight;
		}
		else if (solved) {
			lineColor = this.colors.solved;
		}
		else {
			lineColor = this.colors.unsolved;
		}
		render.line(posA[0], posA[1], posB[0], posB[1], lineColor, 18);
	}
	render.setAlpha();
	// draw vertices
	i = V.length;
	while (i--) {
		var j = graph.renderOrder[i];
		var vertex = V[j];
		render.tile(this.gfx.vertex, vertex[0] - 42, vertex[1] - 42, 84, 84, (solved) ? 84 : 0, 0);
	}
	// draw highlight background
	if (capturedIndex > -1) {
		render.setAlpha(this.hlAlpha);
			var capturedVertex = V[capturedIndex];
			render.graphics(this.gfx.taphl, capturedVertex[0] - 73, capturedVertex[1] - 73);
		render.setAlpha();
	}
	if (this.debugMode) {
		i = V.length;
		while (i--) {
			var j = graph.renderOrder[i];
			var vertex = V[j];
			if (this.userData.debug.showVertexIndex) {
				render.text(j.toString(), vertex[0] - 42 - 15, vertex[1] - 42 - 15, '#fff', 'left', '20px sans-serif');
			}
			if (this.userData.debug.showVertexPosition) {
				render.text(vertex[0] + ', ' + vertex[1], vertex[0] + 42, vertex[1] + 42, '#ff0', 'left', '20px sans-serif');
			}
		}
	}
};

t_gamescreenState.displayTutorial = function(tutId, delay) {
	delay = delay || 0;
	var self = this;
	this.hideTutorial();
	this.tutorialTimeout = setTimeout(function() {
		self.showTutorial = true;
		self.tutorialGfx = t_assetLoader.from('graphics').get(tutId);
		self.tutorialTweens[0].start();
		self.tutorialTweens[1].start();
	}, delay);
};

t_gamescreenState.hideTutorial = function() {
	clearTimeout(this.tutorialTimeout);
	this.tutorialTweens[0].stop();
	this.tutorialTweens[1].stop();
	this.showTutorial = false;
	this.tutorialGfx = null;
};

t_gamescreenState.init = function() {
	var self = this;

	this.gfx = t_assetLoader.from('graphics').get('vertex', 'taphl');
	this.sfx = t_assetLoader.from('sfx').get('pick', 'drop', 'victory', 'intro');

	this.levelData = t_assetLoader.get('data.levels');
	this.userData = t_assetLoader.get('data.user');

	this.nLevels = this.levelData.length;

	this.colors = this.userData.colors || {};

	this.debugMode = this.userData.debug && this.userData.debug.enableDebugMode;

	this.gameAlpha = 0;
	this.gameSurface = new ooze.Surface({
		width: 720,
		height: 1280
	});

	this.lockGame = true;

	this.currentLevel = 1;
	this.graph = null;
	this.capturedIndex = -1;
	this.solved = false;

	this.hlAlpha = 0;

	this.showTutorial = false;
	this.tutorialGfx = null;
	this.tutorialAlpha = 0;
	this.tutorialY = 0;
	this.tutorialAt = 0;
	this.tutorialTimeout = null;
	this.tutorialTweens = [
		new ooze.Tween(0, 1, 250, function(value) {
			self.tutorialAlpha = value;
		}, null, ooze.ease.quadIn),
		new ooze.Tween(960, 940, 500, function(value) {
			self.tutorialY = value;
		}, null, ooze.ease.quadIn, Math.floor)
	];

	this.overlayAlpha = 0;
	this.overlayAlphaMax = 0.4;

	// setup the digits font
	this.digitFont = new ooze.Font({
		graphics: t_assetLoader.get('graphics.digits'),
		size: [30, 30],
		spacing: 7,
		offset: 15,
		widths: {
			'/': 26,
			'0': 28,
			'1': 12,
			'2': 28,
			'3': 28,
			'4': 27,
			'5': 28,
			'6': 28,
			'7': 23,
			'8': 28,
			'9': 28
		}
	});

	// setup icon and options panes
	this.iconPane = new IconPane();
	this.optionsPane = new OptionsPane({
		onMove: function(ratio) {
			ratio = ooze.ease.quadIn(ratio);
			self.iconPane.alpha = ratio;
			self.overlayAlpha = ratio * self.overlayAlphaMax;
		},
		onOpen: function() {
			self.iconPane.enable();
			self.lockGame = true;
		},
		onClose: function() {
			self.iconPane.disable();
			self.lockGame = false;
		}
	});

	// setup next arrow
	this.nextArrow = new NextArrow({
		onPush: function() {
			if (!self.optionsPane.isOpen() && self.currentLevel <= self.nLevels) {
				self.capturedVertex = null;
				self.capturedIndex = -1;
				self.loadLevel(self.currentLevel + 1);
				self.nextArrow.hide(true);

				if (self.tutorialAt === 1) {
					self.tutorialAt = 2;
					self.displayTutorial('tutorial3', 800);
				}
				else if (self.tutorialAt === 3) {
					self.hideTutorial();
				}
			}
		}
	});

	if (t_config.unlocked === undefined || t_config.unlocked < 1) {
		// unlock the first level
		t_config.unlocked = 1;
		t_config.save();
	}
	else if (t_config.unlocked > this.nLevels) {
		t_config.unlocked = this.nLevels;
	}

	// prepare panes
	this.iconPane.disable();
	this.optionsPane.disable();
	this.optionsPane.lock();
	this.optionsPane.setLevel(this.currentLevel);

	// setup game
	this.registerGameEvents();
	if (this.debugMode) {
		this.loadLevel(this.userData.debug.skipToLevel || 1);
	}
	else {
		this.loadLevel(t_config.unlocked || 1);
	}
};

t_gamescreenState.draw = function() {
	this.surface.clear();

	// draw tutorial
	if (this.showTutorial) {
		this.paint.setAlpha(this.tutorialAlpha);
			this.paint.graphics(this.tutorialGfx, 44, this.tutorialY);
		this.paint.setAlpha();
	}

	this.paint.setAlpha(this.gameAlpha);
		this.paint.surface(this.gameSurface, 0, 0);
		this.nextArrow.draw();
	this.paint.setAlpha();

	if (this.overlayAlpha > 0) {
		this.paint.setAlpha(this.overlayAlpha);
			this.paint.rectFill(0, 0, 720, 1280, '#555');
		this.paint.setAlpha();
	}

	this.optionsPane.draw();
	this.iconPane.draw();
};

t_gamescreenState.enter = function() {
	var self = this;

	var firstRun = t_config.unlocked == 1;

	if (!this.debugMode && firstRun) {
		self.optionsPane.setMaxPullHeight();
		setTimeout(function() {
			(new ooze.Tween(0, 1, 250, function(value) {
				self.iconPane.alpha = value;
				self.optionsPane.alpha = value;
				self.gameAlpha = value;
				self.overlayAlpha = value * self.overlayAlphaMax
			}, function() {
				setTimeout(function() {
					self.optionsPane.close(500);
					if (self.currentLevel === 1) {
						self.displayTutorial('tutorial1', 800);
					}
				}, 500);
			}, ooze.ease.linear)).start();
		}, 150);
	}
	else {
		(new ooze.Tween(0, 1, 250, function(value) {
			self.optionsPane.alpha = value;
			self.gameAlpha = value;
		}, function() {
			self.optionsPane.unlock();
			self.lockGame = false;
		}, ooze.ease.linear)).start();
	}
};

t_gamescreenState.exit = function() {
};

//
//  game object
//

var t_game = new ooze.Game({
	canvasId: 'tronix2-game',
	state: t_loadscreenState,
	simpleLoop: true,
	viewMode: 'scale-fit'
});


//
//  input handler
//
var t_input = new ooze.Input(t_game);

// startup
window.addEventListener('load', function() {
	// fetch config
	t_config.load();
	// preload loadscreen assets
	t_assetLoader.load({
		assets: loadscreenAssets,
		done: function() {
			// launch game
			t_game.run();
			// preload game assets
			t_assetLoader.load({
				assets: gameAssets,
				progress: t_loadscreenState.trackProgress,
				done: function() {
					var userData = t_assetLoader.get('data.user');
					var debugMode = userData.debug && userData.debug.enableDebugMode;

					if (debugMode) {
						t_game.setState(t_gamescreenState);
					}
					else {
						t_loadscreenState.showMenu();
					}
				}
			});
		}
	});
});
