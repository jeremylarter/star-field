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
                rate: 1500
            },
            spaceShip: {
                position: {
                    start: {
                        x: canvasWidth / 2,
                        y: canvasHeight - 30
                    }
                },
                fireRate: 200,
                bullet: {
                    speed: 15
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
                    y: canvasHeight / 2
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
            .sample(options.spaceShip.fireRate)
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
                bulletArray.push({x: bullet.x, y: options.spaceShip.position.start.y});
                return bulletArray;
            }, []),

        game = Rx.Observable
            .combineLatest(starStream, enemyStream, bulletStream, spaceShipPosition, function (starArray, enemyArray, bulletArray, spaceShipPosition) {
                //todo: there seems to be a lot of duplication here, can it be simplified?
                var numberOfBullets = bulletArray.length;
                //todo: this does not release memory taken in bulletStream, maybe use flatMapLatest()?
                bulletArray = bulletArray.filter(function (bullet) {
                    return bullet.y > canvasHeight / 2;
                });
                return {
                    starArray: starArray,
                    enemyArray: enemyArray,
                    bulletArray: bulletArray,
                    spaceShipPosition: spaceShipPosition,
                    context: context,
                    debug: numberOfBullets//spaceShipPosition.x
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
            if (enemy.y > canvasHeight) {
                enemy.y = -50;
            }
            enemy.y += 0.5;
            drawTriangle(enemy.x, enemy.y, 25, "#00ff00", false, context);
        });
    }

    function paintBullets(bulletArray, context) {
        bulletArray.forEach(function (bullet) {
            bullet.y -= options.spaceShip.bullet.speed;
            drawTriangle(bullet.x, bullet.y, 5, "#ffff00", true, context);
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
        paintBullets(actors.bulletArray, actors.context);
        paintSpaceShip(actors.spaceShipPosition, actors.context);
        paintScore(actors.debug, actors.context);
    }

    // starStream.subscribe(function (starArray) {
    //     paintStars(starArray, context);
    // });

    game
        .sample(options.starArray.speed)
        .subscribe(renderScene);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    document.body.appendChild(canvas);
}(window, document, Rx));