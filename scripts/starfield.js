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
            spaceShipPosition: {
                start: {
                    x: canvasWidth / 2,
                    y: canvasHeight - 30
                }
            }
        },
        mouseMove = Rx.Observable.fromEvent(canvas, "mousemove"),
        spaceShipPosition = mouseMove
            .map(function (event) {
                return {
                    x: event.clientX,
                    y: options.spaceShipPosition.start.y
                };
            })
            .startWith(options.spaceShipPosition.start),

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

        game = Rx.Observable
            .combineLatest(starStream, enemyStream, spaceShipPosition, function (starArray, enemyArray, spaceShipPosition) {
                //todo: there seems to be a lot of duplication here, can it be simplified?
                return {
                    starArray: starArray,
                    enemyArray: enemyArray,
                    spaceShipPosition: spaceShipPosition,
                    context: context,
                    debug: spaceShipPosition.x
                };
            });

    // function Star(x, y, size) {
    //     this.x = x;
    //     this.y = y;
    //     this.grow = true;
    //     this.size = size;
    // }

    // Star.prototype.pulse = function () {
    //     var this = self;
    //     if (star.grow) {
    //         star.size += 0.01;
    //     } else {
    //         star.size -= 0.1;
    //     }
    //     if (star.size > 6) {
    //         star.grow = false;
    //     }
    //     if (star.size < 1) {
    //         star.grow = true;
    //     }

    // }

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
        paintSpaceShip(actors.spaceShipPosition, actors.context);
        paintScore(actors.debug, actors.context);
    }

    // starStream.subscribe(function (starArray) {
    //     paintStars(starArray, context);
    // });

    game.subscribe(renderScene);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    document.body.appendChild(canvas);
} (window, document, Rx));