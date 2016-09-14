/*jslint browser:true */
/*global window, Rx*/
(function (window, document, Rx) {
    "use strict";

    var canvasWidth = window.innerWidth,
        canvasHeight = window.innerHeight,
        canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),

        options = {
            starArray: {
                speed: 40,
                number: 250
            },
            enemyArray: {
                rate: 1500,
                boundingBoxSize: 25
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
                }
            }
        },

        starStream = Rx.Observable.range(1, options.starArray.number)
            .map(function () {
                return {
                    x: Math.floor(Math.random() * canvasWidth),
                    y: Math.floor(Math.random() * canvasHeight),
                    size: Math.random() * 3 + 1,
                    grow: true
                };
            })
            .toArray()
            .flatMap(function (starArray) {
                return Rx.Observable.interval(options.starArray.speed)
                    .map(function () {
                        starArray.forEach(function (star) {
                            if (star.y >= canvasHeight) {
                                star.y = 0;
                            }
                            star.y += star.size;
                            if (star.grow) {
                                star.size += 0.01;
                            } else {
                                star.size -= 0.1;
                            }
                            if (star.size > 6) {
                                star.grow = false;
                            }
                            if (star.size < 1) {
                                star.grow = true;
                            }
                        });
                        return starArray;
                    });
            }),

        enemyStream = Rx.Observable.interval(options.enemyArray.rate)
            .scan(function (enemyArray) {
                enemyArray.push({
                    x: Math.random() * canvasWidth,
                    y: canvasHeight / 2,
                    alive: true,
                    value: 5
                });
                return enemyArray;
            }, []),

        mouseMove = Rx.Observable.fromEvent(canvas, "mousemove"),
        spaceShipPosition = mouseMove
            .map(function (event) {
                return {
                    x: event.clientX,
                    y: options.spaceShip.position.start.y
                };
            })
            .startWith(options.spaceShip.position.start),

        canvasClick = Rx.Observable.fromEvent(canvas, "click"),
        spaceBarKeyDown = Rx.Observable.fromEvent(window, "keydown")
            .filter(function (event) {
                //console.log(event.keyCode);
                return event.keyCode === 32;
            }),
        bulletFiredStream = Rx.Observable.merge(canvasClick, spaceBarKeyDown)
            .startWith({})
            .sample(options.spaceShip.firing.rate)
            .timestamp(),
        bulletStream = Rx.Observable
            .combineLatest(spaceShipPosition, bulletFiredStream, function (spaceShipPosition, bulletFiredStream) {
                return {
                    timestamp: bulletFiredStream.timestamp,
                    x: spaceShipPosition.x
                };
            })
            .distinctUntilChanged(function (bullet) {
                return bullet.timestamp;
            })
            .scan(function (bulletArray, bullet) {
                //todo: why does a single bullet always fire on page load?
                bulletArray.push({x: bullet.x, y: options.spaceShip.position.start.y, timestamp: bullet.timestamp, live: true});
                if (bulletArray.length > options.spaceShip.bulletArray.number) {
                    //It seems wrong to push on an array for an infinite stream without allowing any garbage collection, so we remove the oldest bullet.
                    //it would also be weird if bullets eventually overflowed float and wrapped around in the world to have another shot as the come back to the screen coordinates.
                    //todo: it would be interesting to profile memory usage without this step.
                    bulletArray.shift();
                }
                return bulletArray;
            }, []),

        scoreSubject = new Rx.BehaviorSubject(0),
        score = scoreSubject
            .scan(function (previous, current) {
                return previous + current;
            }, 0),

        game = Rx.Observable
            .combineLatest(starStream, enemyStream, bulletStream, spaceShipPosition, score, function (starArray, enemyArray, bulletArray, spaceShipPosition, score) {
                //todo: there seems to be a lot of duplication here, can it be simplified?
                var debug = "" + (bulletArray.length ? bulletArray[bulletArray.length - 1].timestamp : "0");
                debug += "\r\nbulletArray.length = " + bulletArray.length;
                return {
                    starArray: starArray,
                    enemyArray: enemyArray,
                    bulletArray: bulletArray,
                    spaceShipPosition: spaceShipPosition,
                    score: score,
                    context: context,
                    debug: debug
                };
            });

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

    function paintBackground(context) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    function paintStars(starArray, context) {
        //todo: can we inject a painter with generic methods so that we can switch to svg?
        context.fillStyle = "#ffffff";
        starArray.forEach(function (star) {
            context.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    function paintEnemies(enemyArray, context) {
        enemyArray.forEach(function (enemy) {
            if (enemy.alive) {
                if (enemy.y > canvasHeight) {
                    enemy.y = -50;
                }
                enemy.y += 0.5;
                drawTriangle(enemy.x, enemy.y, 25, "#00ff00", false, context);
            }
        });
    }

    function collision(enemy, bullet, boundingBoxSize) {
        return (enemy.x > bullet.x - boundingBoxSize && enemy.x < bullet.x + boundingBoxSize) &&
                (enemy.y > bullet.y - boundingBoxSize && enemy.y < bullet.y + boundingBoxSize);
    }

    function paintBullets(bulletArray, enemyArray, scoreSubject, context) {
        bulletArray.forEach(function (bullet) {
            if (bullet.live) {
                bullet.y -= options.spaceShip.firing.speed;//todo: convert this to frames per second so the refresh is smooth.
                //todo: replace magic number for screen top = 0
                if (bullet.y < 0) {
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
        paintBackground(context);
        paintStars(actors.starArray, actors.context);
        paintEnemies(actors.enemyArray, actors.context);
        paintBullets(actors.bulletArray, actors.enemyArray, scoreSubject, actors.context);
        paintSpaceShip(actors.spaceShipPosition, actors.context);
        paintScore(actors.score, actors.context);
    }

    game
        .sample(options.starArray.speed)
        .subscribe(renderScene);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    document.body.appendChild(canvas);
}(window, document, Rx));