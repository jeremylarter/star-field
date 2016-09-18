/*jslint browser:true */
/*global window, Rx, Random*/

(function (window, document, Rx, Random) {
    "use strict";

    var getRandom = Random.getRandom,
        // getRandom = Math.random,
        randomObservable = Random.randomObservable,
        canvasWidth = window.innerWidth,
        canvasHeight = window.innerHeight,
        canvas = document.createElement("canvas"),
        //todo: wrap and inject all instances of functions with side effects such as keyboard and mouse input, canvas output, canvas changes (e.g. window resize)
        screenStream = new Rx.BehaviorSubject({
            //todo: replace with an observer of the canvas attributes as they are resized.
            origin: {
                x: 0,
                y: 0
            },
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight
        }),//hot observable

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
                boundingBoxSize: 25
            },
            enemyBulletArray: {
                rate: 200,
                number: 1000,
                firing: {
                    speed: 12
                }
            },
            spaceShip: {
                position: {
                    start: {
                        x: canvasWidth / 2,
                        y: canvasHeight - 30
                    }
                },
                firing: {
                    rate: 200,
                    speed: 15
                },
                bulletArray: {
                    number: 250
                },
                boundingBoxSize: 20
            }
        },
        optionsSubject = new Rx.BehaviorSubject(options),

        getNextStar = function (star, screen) {
            var nextStar = {
                x: star.x,
                y: star.y + star.size,
                grow: star.grow
            };

            if (star.y >= screen.bottom) {
                nextStar.y = screen.top;
            }
            if (star.grow) {
                nextStar.size = star.size + 0.01;
            } else {
                nextStar.size = star.size - 0.1;
            }
            if (star.size > 6) {
                nextStar.grow = false;
            }
            if (star.size < 1) {
                nextStar.grow = true;
            }

            return nextStar;
        },
        numberOfRandomPropertiesForStarStream = 3,
        starStreamRandomizer = randomObservable.take(numberOfRandomPropertiesForStarStream * options.starArray.number)//cold observable
            .bufferWithCount(numberOfRandomPropertiesForStarStream)
            .map(function (randomNumberArray) {
                return {
                    x: randomNumberArray[0],
                    y: randomNumberArray[1],
                    size: randomNumberArray[2]
                };
            }),
        initialScreenAttributes = screenStream.take(1),//cold observable
        initialStarStream = Rx.Observable
            .combineLatest([starStreamRandomizer, initialScreenAttributes], function (starStreamRandomized, screenAttributes) {
                return {
                    x: Math.floor(starStreamRandomized.x * screenAttributes.canvasWidth),
                    y: Math.floor(starStreamRandomized.y * screenAttributes.canvasHeight),
                    size: starStreamRandomized.size * 3 + 1,
                    grow: true
                };
            }),//combine 2 cold observables results in another cold observable, so take is not required here
        getNextStarArray = function (starArray, screenStream) {
            var nextStarArray = [];
            screenStream.take(1).subscribe(function (screen) {
                starArray.forEach(function (star) {
                    nextStarArray.push(getNextStar(star, {
                        top: screen.origin.y,
                        bottom: screen.canvasHeight
                    }));
                });
            });
            return nextStarArray;
        },
        starStream = initialStarStream
            .toArray()
            .flatMap(function (starArray) {
                return Rx.Observable.interval(options.starArray.speed)//hot observable
                    .map(function () {
                        starArray = getNextStarArray(starArray, screenStream);//note: we need to mutate starArray closure to persist state changes

                        return starArray;
                    });
            }),

        //todo: this is really the enemyArivalStream that also creates an enemy. Use a different stream for enemy creation.
        enemyStream = Rx.Observable.interval(options.enemyArray.rate)
            .scan(function (enemyArray) {
                enemyArray.push({
                    x: getRandom() * canvasWidth,
                    y: canvasHeight / 2,
                    alive: true,
                    value: 5
                });
                return enemyArray;
            }, []),

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

        gameStreamArray = [optionsSubject, starStream, enemyStream, enemyBulletStream, bulletStream, spaceShipPositionStream, scoreStream, screenStream],
        gameCombineLatest = function (options, starArray, enemyArray, enemyBulletArray, bulletArray, spaceShipPosition, score, screen) {
            return {
                options: options,
                starArray: starArray,
                enemyArray: enemyArray,
                enemyBulletArray: enemyBulletArray,
                bulletArray: bulletArray,
                spaceShipPosition: spaceShipPosition,
                score: score,
                screen: screen
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

    function paintStars(starArray, context) {
        //todo: can we inject a painter with generic methods so that we can switch to svg?
        context.fillStyle = "#ffffff";
        starArray.forEach(function (star) {
            context.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    function fireAtWill(enemy, bullet) {
        bullet.x = enemy.x;
        bullet.y = enemy.y;
        bullet.fired = true;
    }

    function decideToFire(chance) {
        return getRandom() < chance;
    }

    function paintEnemies(enemyArray, enemyBulletArray, context) {
        enemyArray.forEach(function (enemy) {
            var bulletClip = enemyBulletArray.filter(function (bullet) {
                return bullet.live && !bullet.fired;
            });

            if (enemy.alive) {
                if (enemy.y > canvasHeight) {
                    enemy.y = -50;
                }
                enemy.y += 0.5;

                if (bulletClip.length && decideToFire(0.1)) {
                    fireAtWill(enemy, bulletClip[0]);
                }

                drawTriangle(enemy.x, enemy.y, 25, "#00ff00", false, context);
            }
        });
    }

    function collision(enemy, bullet, boundingBoxSize) {
        return (enemy.x > bullet.x - boundingBoxSize && enemy.x < bullet.x + boundingBoxSize) &&
                (enemy.y > bullet.y - boundingBoxSize && enemy.y < bullet.y + boundingBoxSize);
    }

    function paintEnemyBullets(enemyBulletArray, spaceShipPosition, scoreSubject, context) {
        enemyBulletArray.forEach(function (bullet) {
            if (bullet.live && bullet.fired) {
                bullet.y += options.enemyBulletArray.firing.speed;
                if (bullet.y > canvasHeight) {
                    bullet.live = false;
                }
                drawTriangle(bullet.x, bullet.y, 10, "#ff1122", false, context);

                if (collision(spaceShipPosition, bullet, options.spaceShip.boundingBoxSize)) {
                    bullet.live = false;
                    scoreSubject.onNext(-100);
                }
            }
        });
    }

    function paintBullets(bulletArray, enemyArray, scoreSubject, screenTop, context) {
        bulletArray.forEach(function (bullet) {
            if (bullet.live) {
                bullet.y -= options.spaceShip.firing.speed;
                if (bullet.y < screenTop) {
                    bullet.live = false;
                }
                drawTriangle(bullet.x, bullet.y, 5, "#ffff00", true, context);

                enemyArray.forEach(function (enemy) {
                    if (enemy.alive && collision(enemy, bullet, options.enemyArray.boundingBoxSize)) {
                        enemy.alive = false;
                        bullet.live = false;
                        scoreSubject.onNext(enemy.value);
                    }
                });
            }
        });
    }

    function paintSpaceShip(position, context) {
        drawTriangle(position.x, position.y, 20, "#ff0000", true, context);
    }

    function paintScore(score, context) {
        context.fillStyle = "#ffffff";
        context.font = "bold 3em sans-serif";
        context.fillText("Score: " + score, 40, 43);
    }

    function renderScene(actors) {
        var scoreSubject = actors.options.scoreSubject,
            context = actors.options.context,
            screen = {
                left: actors.screen.origin.x,
                top: actors.screen.origin.y,
                right: actors.screen.canvasWidth,
                bottom: actors.screen.canvasHeight
            };

        paintBackground(screen, context);
        paintStars(actors.starArray, context);
        paintEnemies(actors.enemyArray, actors.enemyBulletArray, context);
        paintEnemyBullets(actors.enemyBulletArray, actors.spaceShipPosition, scoreSubject, context);
        paintBullets(actors.bulletArray, actors.enemyArray, scoreSubject, screen.top, context);
        paintSpaceShip(actors.spaceShipPosition, context);
        paintScore(actors.score, context);
    }

    game
        .sample(options.starArray.speed)
        .subscribe(renderScene);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    document.body.appendChild(canvas);
}(window, document, Rx, Random));

