var SnailBait = function () {
    this.canvas = document.getElementById('game-canvas'),
        this.context = this.canvas.getContext('2d'),
        this.fpsElement = document.getElementById('fps'),

        // Constants.........................................................

        this.LEFT = 1,
        this.RIGHT = 2,

        this.TRANSPARENT = 0,
        this.OPAQUE = 1.0,

        this.BACKGROUND_VELOCITY = 42,

        this.PLATFORM_HEIGHT = 8,
        this.PLATFORM_STROKE_WIDTH = 2,
        this.PLATFORM_STROKE_STYLE = 'rgb(0,0,0)',

        this.RUNNER_LEFT = 50,
        this.STARTING_RUNNER_TRACK = 1,

        // Track baselines...................................................

        this.TRACK_1_BASELINE = 323,
        this.TRACK_2_BASELINE = 223,
        this.TRACK_3_BASELINE = 123,

        // Platform scrolling offset (and therefore speed) is
        // PLATFORM_VELOCITY_MULTIPLIER * backgroundOffset: The
        // platforms move PLATFORM_VELOCITY_MULTIPLIER times as
        // fast as the background.

        this.PLATFORM_VELOCITY_MULTIPLIER = 4.35,

        this.STARTING_BACKGROUND_VELOCITY = 0,

        this.STARTING_PLATFORM_OFFSET = 0,
        this.STARTING_BACKGROUND_OFFSET = 0,

        // States............................................................

        this.paused = false;
    this.PAUSED_CHECK_INTERVAL = 200;
    this.windowHasFocus = true;
    this.countdownInProgress = false;

    // Images............................................................

    this.background = new Image(),
        this.runnerImage = new Image(),

        // Time..............................................................

        this.lastAnimationFrameTime = 0,
        this.lastFpsUpdateTime = 0,
        this.fps = 60,

        this.fpsElement = document.getElementById('fps'),

        // Toast.............................................................

        this.toastElement = document.getElementById('toast'),

        // Runner track......................................................

        this.runnerTrack = this.STARTING_RUNNER_TRACK,

        // Translation offsets...............................................

        this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET,
        this.platformOffset = this.STARTING_PLATFORM_OFFSET,

        // Velocities........................................................

        this.bgVelocity = this.STARTING_BACKGROUND_VELOCITY,
        this.platformVelocity,

        // Platforms.........................................................

        this.platformData = [
            // Screen 1.......................................................
            {
                left: 10,
                width: 230,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(150,190,255)',
                opacity: 1.0,
                track: 1,
                pulsate: false,
            },

            {
                left: 250,
                width: 100,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(150,190,255)',
                opacity: 1.0,
                track: 2,
                pulsate: false,
            },

            {
                left: 400,
                width: 125,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(250,0,0)',
                opacity: 1.0,
                track: 3,
                pulsate: false
            },

            {
                left: 633,
                width: 100,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(80,140,230)',
                opacity: 1.0,
                track: 1,
                pulsate: false,
            },

            // Screen 2.......................................................

            {
                left: 810,
                width: 100,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(200,200,0)',
                opacity: 1.0,
                track: 2,
                pulsate: false
            },

            {
                left: 1025,
                width: 100,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(80,140,230)',
                opacity: 1.0,
                track: 2,
                pulsate: false
            },

            {
                left: 1200,
                width: 125,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'aqua',
                opacity: 1.0,
                track: 3,
                pulsate: false
            },

            {
                left: 1400,
                width: 180,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(80,140,230)',
                opacity: 1.0,
                track: 1,
                pulsate: false,
            },

            // Screen 3.......................................................

            {
                left: 1625,
                width: 100,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(200,200,0)',
                opacity: 1.0,
                track: 2,
                pulsate: false
            },

            {
                left: 1800,
                width: 250,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(80,140,230)',
                opacity: 1.0,
                track: 1,
                pulsate: false
            },

            {
                left: 2000,
                width: 100,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'rgb(200,200,80)',
                opacity: 1.0,
                track: 2,
                pulsate: false
            },

            {
                left: 2100,
                width: 100,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'aqua',
                opacity: 1.0,
                track: 3,
            },


            // Screen 4.......................................................

            {
                left: 2269,
                width: 200,
                height: this.PLATFORM_HEIGHT,
                fillStyle: 'gold',
                opacity: 1.0,
                track: 1,
            },

            {
                left: 2500,
                width: 200,
                height: this.PLATFORM_HEIGHT,
                fillStyle: '#2b950a',
                opacity: 1.0,
                track: 2,
                snail: true
            },
        ];
};

SnailBait.prototype = {
    draw: function (now) {
        snailBait.setPlatformVelocity();
        snailBait.setOffsets(now);

        snailBait.drawBackground();
        snailBait.drawRunner();
        snailBait.drawPlatforms();
    },

    setPlatformVelocity: function () {
        snailBait.platformVelocity = snailBait.bgVelocity *
            snailBait.PLATFORM_VELOCITY_MULTIPLIER;
    },

    setOffsets: function (now) {
        snailBait.setBackgroundOffset(now);
        snailBait.setPlatformOffset(now);
    },

    setBackgroundOffset: function (now) {
        snailBait.backgroundOffset +=
            snailBait.bgVelocity * (now - snailBait.lastAnimationFrameTime) / 1000;

        if (snailBait.backgroundOffset < 0 ||
            snailBait.backgroundOffset > this.background.width) {
            snailBait.backgroundOffset = 0;
        }
    },

    setPlatformOffset: function (now) {
        snailBait.platformOffset +=
            snailBait.platformVelocity * (now - snailBait.lastAnimationFrameTime) / 1000;

        if (snailBait.platformOffset > 2 * snailBait.background.width) {
            snailBait.turnLeft();
        } else if (this.platformOffset < 0) {
            snailBait.turnRight();
        }
    },

    drawBackground: function () {
        snailBait.context.translate(-this.backgroundOffset, 0);

        // Initially onscreen:
        snailBait.context.drawImage(this.background, 0, 0);

        // Initially offscreen:
        snailBait.context.drawImage(this.background, this.background.width, 0);

        snailBait.context.translate(this.backgroundOffset, 0);
    },

    drawRunner: function () {
        snailBait.context.drawImage(
            snailBait.runnerImage,
            snailBait.RUNNER_LEFT,
            snailBait.calculatePlatformTop(snailBait.runnerTrack) -
            snailBait.runnerImage.height);
    },

    drawPlatform: function (data) {
        var platformTop = snailBait.calculatePlatformTop(data.track);

        snailBait.context.lineWidth = snailBait.PLATFORM_STROKE_WIDTH;
        snailBait.context.strokeStyle = snailBait.PLATFORM_STROKE_STYLE;
        snailBait.context.fillStyle = data.fillStyle;
        snailBait.context.globalAlpha = data.opacity;

        snailBait.context.strokeRect(data.left, platformTop, data.width, data.height);
        snailBait.context.fillRect(data.left, platformTop, data.width, data.height);
    },

    drawPlatforms: function () {
        var index;

        snailBait.context.translate(-snailBait.platformOffset, 0);

        for (index = 0; index < snailBait.platformData.length; ++index) {
            snailBait.drawPlatform(snailBait.platformData[index]);
        }

        snailBait.context.translate(snailBait.platformOffset, 0);
    },

    calculateFps: function (now) {
        var fps = 1 / (now - snailBait.lastAnimationFrameTime) * 1000;

        if (now - snailBait.lastFpsUpdateTime > 1000) {
            snailBait.lastFpsUpdateTime = now;
            snailBait.fpsElement.innerHTML = fps.toFixed(0) + ' fps';
        }
        return fps;
    },

    calculatePlatformTop: function (track) {
        if (track === 1) {
            return snailBait.TRACK_1_BASELINE;
        } // 323 pixels
        else if (track === 2) {
            return snailBait.TRACK_2_BASELINE;
        } // 223 pixels
        else if (track === 3) {
            return snailBait.TRACK_3_BASELINE;
        } // 123 pixels
    },

    turnLeft: function () {
        snailBait.bgVelocity = -snailBait.BACKGROUND_VELOCITY;
    },

    turnRight: function () {
        snailBait.bgVelocity = snailBait.BACKGROUND_VELOCITY;
    },

    revealToast: function (text, duration) {
        var DEFAULT_TOAST_DISPLAY_DURATION = 1000;

        duration = duration || DEFAULT_TOAST_DISPLAY_DURATION;

        snailBait.toastElement.style.display = 'block';
        snailBait.toastElement.innerHTML = text;

        setTimeout(function (e) {
            if (snailBait.windowHasFocus) {
                snailBait.toastElement.style.display = 'none';
            }
        }, duration);
    },

    // Animation............................................................

    animate: function (now) {
        if (snailBait.paused) {
            setTimeout(function () {
                requestNextAnimationFrame(snailBait.animate);
            }, snailBait.PAUSED_CHECK_INTERVAL);
        } else {
            snailBait.fps = snailBait.calculateFps(now);
            snailBait.draw(now);
            snailBait.lastAnimationFrameTime = now;
            requestNextAnimationFrame(snailBait.animate);
        }
    },

    togglePaused: function () {
        var now = +new Date();

        snailBait.paused = !snailBait.paused;

        if (snailBait.paused) {
            snailBait.pauseStartTime = now;
        } else {
            snailBait.lastAnimationFrameTime += (now - snailBait.pauseStartTime);
        }
    },

    // ------------------------- INITIALIZATION ----------------------------

    initializeImages: function () {
        snailBait.background.src = 'images/background.png';
        snailBait.runnerImage.src = 'images/runner.png';

        snailBait.background.onload = function (e) {
            snailBait.startGame();
        };
    },

    startGame: function () {
        requestNextAnimationFrame(this.animate);
    }
};

// Event handlers.......................................................

window.addEventListener('keydown', function (e) {
    var key = e.keyCode;

    if (key === 68 || key === 37) { // 'd' or left arrow
        snailBait.turnLeft();
    } else if (key === 75 || key === 39) { // 'k' or right arrow
        snailBait.turnRight();
    } else if (key === 80) { // 'p'
        snailBait.togglePaused();
    }
});

window.addEventListener('blur', function (e) {
    snailBait.windowHasFocus = false;

    if (!snailBait.paused) {
        snailBait.togglePaused();
    }
});

window.addEventListener('focus', function (e) {
    var originalFont = snailBait.toastElement.style.fontSize,
        DIGIT_DISPLAY_DURATION = 1000; // milliseconds

    snailBait.windowHasFocus = true;
    snailBait.countdownInProgress = true;

    if (snailBait.paused) {
        snailBait.toastElement.style.font = '128px fantasy'; // Large font

        if (snailBait.windowHasFocus && snailBait.countdownInProgress)
            snailBait.revealToast('3', 1000); // Display 3 for 1.0 seconds

        setTimeout(function (e) {
            if (snailBait.windowHasFocus && snailBait.countdownInProgress)
                snailBait.revealToast('2', 1000); // Display 2 for 1.0 seconds

            setTimeout(function (e) {
                if (snailBait.windowHasFocus && snailBait.countdownInProgress)
                    snailBait.revealToast('1', 1000); // Display 1 for 1.0 seconds

                setTimeout(function (e) {
                    if (snailBait.windowHasFocus && snailBait.countdownInProgress)
                        snailBait.togglePaused();

                    if (snailBait.windowHasFocus && snailBait.countdownInProgress)
                        snailBait.toastElement.style.fontSize = originalFont;

                    snailBait.countdownInProgress = false;

                }, DIGIT_DISPLAY_DURATION);

            }, DIGIT_DISPLAY_DURATION);

        }, DIGIT_DISPLAY_DURATION);
    }
});

// Launch game.........................................................

var snailBait = new SnailBait();

snailBait.initializeImages();

