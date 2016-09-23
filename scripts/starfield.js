/*jslint browser:true */
/*global window, Rx, Random*/
//note: instead of inventing a refactoring to isolate side effects I have decided to use http://cycle.js.org/
(function (window, document, Rx, Random) {
    "use strict";

    var getRandom = Random.getRandom,
        // getRandom = Math.random,
        randomObservable = Random.randomObservable,
        canvas = document.createElement("canvas"),
        windowSizeStream = Rx.Observable.fromEvent(window, "resize"),
        initialCanvasAttributes = {
            origin: {
                x: 0,
                y: 0
            },
            canvasWidth: window.innerWidth,
            canvasHeight: window.innerHeight
        },
        canvasStream = windowSizeStream
            .startWith(initialCanvasAttributes)
            .map(function () {
                return {
                    origin: {
                        x: 0,
                        y: 0
                    },
                    canvasWidth: window.innerWidth,
                    canvasHeight: window.innerHeight
                };
            }),//hot observable
        ValidAudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext,
        soundContext = ValidAudioContext
            ? new ValidAudioContext()
            : undefined,
        createSound = function (note, duration) {
            var oscillator,
                //https://en.wikipedia.org/wiki/Piano_key_frequencies
                noteList = {C: 261.626, D: 293.665, E: 329.628, F: 349.228, G: 391.995, A: 440.000, B: 493.883},
                noteFrequency = Object.prototype.hasOwnProperty.call(noteList, note)
                    ? noteList[note]
                    : 440;

            if (!soundContext) {
                return;
            }
            duration = duration || 0.15;
            oscillator = soundContext.createOscillator();
            oscillator.connect(soundContext.destination);
            oscillator.type = "sine";
            oscillator.frequency.value = noteFrequency;
            oscillator.start();
            oscillator.stop(soundContext.currentTime + duration);
        },

        options = {
            keyCodeList: {
                fireBullet: 32//space bar
            },
            scoreSubject: new Rx.BehaviorSubject(0),
            context: canvas.getContext("2d"),
            starArray: {
                speed: 40,//40 milliseconds between frames = 25 frames per second
                number: 250
            },
            enemyArray: {
                rate: 1500,
                boundingBoxSize: 30
            },
            enemyBulletArray: {
                rate: 200,
                number: 1000,
                firing: {
                    speed: 0.012
                }
            },
            spaceShip: {
                position: {
                    start: {
                        x: 0.5,
                        y: 0.9
                    }
                },
                firing: {
                    rate: 200,
                    speed: 0.015
                },
                bulletArray: {
                    number: 250
                },
                boundingBoxSize: 25
            }
        },
        optionsSubject = new Rx.BehaviorSubject(options),

        getNextStar = function (star) {
            var nextStar = {
                x: star.x,
                y: star.y + star.size,
                grow: star.grow
            };

            if (star.y >= 1) {
                nextStar.y = 0;
            }
            if (star.grow) {
                nextStar.size = star.size + 0.000001;
            } else {
                nextStar.size = star.size - 0.0001;
            }
            if (star.size > 0.006) {
                nextStar.grow = false;
            }
            if (star.size < 0.001) {
                nextStar.grow = true;
            }

            return nextStar;
        },
        numberOfRandomPropertiesForStarStream = 3,
        initialStarStream = randomObservable.take(numberOfRandomPropertiesForStarStream * options.starArray.number)//cold observable
            .bufferWithCount(numberOfRandomPropertiesForStarStream)
            .map(function (randomNumberArray) {
                return {
                    x: randomNumberArray[0],
                    y: randomNumberArray[1],
                    size: randomNumberArray[2] * 0.005 + 0.001,
                    grow: false
                };
            }),
        getNextStarArray = function (starArray) {
            var nextStarArray = [];
            starArray.forEach(function (star) {
                nextStarArray.push(getNextStar(star));
            });
            return nextStarArray;
        },
        starStream = initialStarStream
            .toArray()
            .flatMap(function (starArray) {
                return Rx.Observable.interval(options.starArray.speed)//hot observable
                    .map(function () {
                        starArray = getNextStarArray(starArray);//note: we need to mutate starArray closure to persist state changes

                        return starArray;
                    });
            }),

        maxNumberOfEnemies = 1000,
        numberOfRandomPropertiesForEnemyStream = 2,
        initialEnemyStream = randomObservable.take(maxNumberOfEnemies)//cold observable
            .bufferWithCount(numberOfRandomPropertiesForEnemyStream)
            .map(function (randomNumberArray) {
                return {
                    x: randomNumberArray[0],
                    y: randomNumberArray[1],
                    alive: false,
                    value: 5
                };
            }),
        enemyStream = initialEnemyStream
            .toArray()
            .flatMap(function (enemyArray) {
                return Rx.Observable.interval(options.enemyArray.rate)//hot observable
                    .map(function (index) {
                        if (index < enemyArray.length && !enemyArray[index].alive) {
                            enemyArray[index].alive = true;//note: we need to mutate enemyArray closure to persist state changes
                        }

                        return enemyArray;
                    });
            }),

        enemyBulletStream = Rx.Observable.interval(options.enemyBulletArray.rate)
            .scan(function (enemyBulletArray) {
                enemyBulletArray.push({
                    live: true,
                    fired: false
                });
                if (enemyBulletArray.length > options.enemyBulletArray.number) {
                    enemyBulletArray.shift();
                }
                return enemyBulletArray;
            }, []),

        mouseMove = Rx.Observable.fromEvent(canvas, "mousemove"),
        spaceShipPositionStream = mouseMove
            .map(function (event) {
                return {
                    x: event.clientX,
                    y: options.spaceShip.position.start.y
                };
            })
            .startWith(options.spaceShip.position.start),

        canvasMouseDown = Rx.Observable.fromEvent(canvas, "mousedown"),//triggered after mousedown, still requires mouseup between events
        fireBulletKeyDown = Rx.Observable.fromEvent(window, "keydown")
            .filter(function (event) {
                return event.keyCode === options.keyCodeList.fireBullet;
            }),
        blankBullet = {},
        bulletFiredStream = Rx.Observable.merge(canvasMouseDown, fireBulletKeyDown)
            .startWith(blankBullet)
            .sample(options.spaceShip.firing.rate)
            .timestamp(),
        bulletStream = Rx.Observable
            .combineLatest(spaceShipPositionStream, bulletFiredStream, function (spaceShipPosition, bulletFired) {
                return {
                    timestamp: bulletFired.timestamp,
                    x: spaceShipPosition.x,
                    live: bulletFired.value !== blankBullet
                };
            })
            .distinctUntilChanged(function (bullet) {
                return bullet.timestamp;
            })
            .scan(function (bulletArray, bullet) {
                if (bullet.live) {
                    createSound("C");
                }
                bulletArray.push({x: bullet.x, y: options.spaceShip.position.start.y, timestamp: bullet.timestamp, live: bullet.live});
                if (bulletArray.length > options.spaceShip.bulletArray.number) {
                    bulletArray.shift();
                }
                return bulletArray;
            }, []),

        scoreStream = options.scoreSubject
            .scan(function (previous, current) {
                return previous + current;
            }, 0),

        gameStreamArray = [optionsSubject, starStream, enemyStream, enemyBulletStream, bulletStream, spaceShipPositionStream, scoreStream, canvasStream],
        gameCombineLatest = function (options, starArray, enemyArray, enemyBulletArray, bulletArray, spaceShipPosition, score, canvas) {
            return {
                options: options,
                starArray: starArray,
                enemyArray: enemyArray,
                enemyBulletArray: enemyBulletArray,
                bulletArray: bulletArray,
                spaceShipPosition: spaceShipPosition,
                score: score,
                canvas: canvas
            };
        },
        game = Rx.Observable.combineLatest(gameStreamArray, gameCombineLatest);

    function drawTriangle(x, y, width, color, pointUp, context) {
        var triangleHeight = pointUp
            ? -width
            : width;

        context.fillStyle = color;
        context.beginPath();
        context.moveTo(x - width, y);
        context.lineTo(x, y + triangleHeight);
        context.lineTo(x + width, y);
        context.lineTo(x - width, y);
        context.fill();
    }

    function paintBackground(screen, context) {
        context.fillStyle = "#000000";
        context.fillRect(screen.left, screen.top, screen.right, screen.bottom);
    }

    function paintStars(starArray, screen, context) {
        context.fillStyle = "#ffffff";
        starArray.forEach(function (star) {
            var average = (screen.right + screen.bottom) / 2;

            context.fillRect(star.x * screen.right, star.y * screen.bottom, star.size * average, star.size * average);
        });
    }

    function fireAtWill(enemy, bullet) {
        bullet.x = enemy.x;
        bullet.y = enemy.y;
        bullet.fired = true;
    }

    function decideToFire(chance) {
        //todo: replace getRandom() with randomObservable
        return getRandom() < chance;
    }

    function paintEnemies(enemyArray, enemyBulletArray, screen, context) {
        enemyArray.forEach(function (enemy) {
            var bulletClip = enemyBulletArray.filter(function (bullet) {
                return bullet.live && !bullet.fired;
            });

            if (enemy.alive) {
                if (enemy.y > 1) {
                    enemy.y = -0.01;
                }
                enemy.y += 0.005;

                if (bulletClip.length && decideToFire(0.1)) {
                    fireAtWill(enemy, bulletClip[0]);
                }
                drawTriangle(enemy.x * screen.right, enemy.y * screen.bottom, 25, "#00ff00", false, context);
            }
        });
    }

    function collision(enemy, bullet, boundingBoxSize) {
        return (enemy.x > bullet.x - boundingBoxSize && enemy.x < bullet.x + boundingBoxSize) &&
                (enemy.y > bullet.y - boundingBoxSize && enemy.y < bullet.y + boundingBoxSize);
    }

    function paintEnemyBullets(enemyBulletArray, spaceShipPosition, scoreSubject, screen, context) {
        enemyBulletArray.forEach(function (bullet) {
            if (bullet.live && bullet.fired) {
                bullet.y += options.enemyBulletArray.firing.speed;
                if (bullet.y > 1) {
                    bullet.live = false;
                }
                drawTriangle(bullet.x * screen.right, bullet.y * screen.bottom, 10, "#ff1122", false, context);

                if (collision({x: spaceShipPosition.x / screen.right, y: spaceShipPosition.y}, bullet, options.spaceShip.boundingBoxSize / screen.right)) {
                    bullet.live = false;
                    scoreSubject.onNext(-100);
                    Rx.Observable.interval(150).take(3).subscribe(function () {
                        createSound("E", 0.05);
                    });
                }
            }
        });
    }

    function paintBullets(bulletArray, enemyArray, scoreSubject, screen, context) {
        bulletArray.forEach(function (bullet) {
            if (bullet.live) {
                bullet.y -= options.spaceShip.firing.speed;
                if (bullet.y < 0) {
                    bullet.live = false;
                }
                drawTriangle(bullet.x, bullet.y * screen.bottom, 5, "#ffff00", true, context);

                enemyArray.forEach(function (enemy) {
                    if (enemy.alive && collision(enemy, {x: bullet.x / screen.right, y: bullet.y}, options.enemyArray.boundingBoxSize / screen.right)) {
                        enemy.alive = false;
                        bullet.live = false;
                        scoreSubject.onNext(enemy.value);
                        createSound("B", 0.1);
                    }
                });
            }
        });
    }

    function paintSpaceShip(position, screen, context) {
        drawTriangle(position.x, position.y * screen.bottom, 20, "#ff0000", true, context);
    }

    function paintScore(score, screen, context) {
        context.fillStyle = "#ffffff";
        context.font = "bold 3em sans-serif";
        context.fillText("Score: " + score, 0.1 * screen.right, 0.1 * screen.bottom);
    }

    // function drawSquare(x1, y1, side, color, context) {
    //     context.beginPath();
    //     context.strokeStyle = color;
    //     context.rect(x1 - side, y1, side + side, side);
    //     context.stroke();
    // }

    // function paintBoundingBoxes(enemyArray, enemyBulletArray, spaceShipPosition, bulletArray, screen, context) {
    //     var color = "#aaaaaa";

    //     enemyArray.map(function (enemy) {
    //         drawSquare(enemy.x * screen.right, enemy.y * screen.bottom, 25, color, context);
    //     });
    //     enemyBulletArray.map(function (enemyBullet) {
    //         drawSquare(enemyBullet.x * screen.right, enemyBullet.y * screen.bottom, 10, color, context);
    //     });
    //     bulletArray.map(function (bullet) {
    //         drawSquare(bullet.x * screen.right, bullet.y * screen.bottom, 5, "#cccccc", context);
    //     });
    //     drawSquare(spaceShipPosition.x * screen.right, spaceShipPosition.y * screen.bottom, 20, "#ffcccc", context);
    // }

    function renderScene(actors) {
        var scoreSubject = actors.options.scoreSubject,
            context = actors.options.context,
            screen = {
                left: actors.canvas.origin.x,
                top: actors.canvas.origin.y,
                right: actors.canvas.canvasWidth,
                bottom: actors.canvas.canvasHeight
            };
        canvas.width = actors.canvas.canvasWidth;
        canvas.height = actors.canvas.canvasHeight;

        paintBackground(screen, context);
        paintStars(actors.starArray, screen, context);
        paintEnemies(actors.enemyArray, actors.enemyBulletArray, screen, context);
        paintEnemyBullets(actors.enemyBulletArray, actors.spaceShipPosition, scoreSubject, screen, context);
        paintBullets(actors.bulletArray, actors.enemyArray, scoreSubject, screen, context);
        paintSpaceShip(actors.spaceShipPosition, screen, context);
        paintScore(actors.score, screen, context);
        //paintBoundingBoxes(actors.enemyArray, actors.enemyBulletArray, actors.spaceShipPosition, actors.bulletArray, screen, context);
    }

    game
        .sample(options.starArray.speed)
        .subscribe(renderScene);

    canvas.width = initialCanvasAttributes.canvasWidth;
    canvas.height = initialCanvasAttributes.canvasHeight;
    document.body.appendChild(canvas);
}(window, document, Rx, Random));

