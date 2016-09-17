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

        options = {
            scoreSubject: new Rx.BehaviorSubject(0),
            context: canvas.getContext("2d"),
            starArray: {
                speed: 40,
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

        starBehavior = function (star) {
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
        },
        //todo: wrap and inject all instances of functions with side effects such as keyboard and mouse input, canvas output, canvas changes (e.g. window resize)
        canvasAttributesStream = new Rx.BehaviorSubject({
            //todo: replace with an observer of the canvas attributes as they are resized.
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight
        }),
        numberOfRandomPropertiesForStarStream = 3,
        starStreamRandomizer = randomObservable.take(numberOfRandomPropertiesForStarStream * options.starArray.number)
            .bufferWithCount(numberOfRandomPropertiesForStarStream)
            .map(function (randomNumberArray) {
                return {
                    x: randomNumberArray[0],
                    y: randomNumberArray[1],
                    size: randomNumberArray[2]
                };
            }),
        starStream = Rx.Observable
            .combineLatest([starStreamRandomizer, canvasAttributesStream], function (starStreamRandomized, canvasAttributesStream) {
                return {
                    x: Math.floor(starStreamRandomized.x * canvasAttributesStream.canvasWidth),
                    y: Math.floor(starStreamRandomized.y * canvasAttributesStream.canvasHeight),
                    size: starStreamRandomized.size * 3 + 1,
                    grow: true
                };
            })
            .take(options.starArray.number)//todo: why is this needed when starStreamRandomized will only contain this many elements?
            .toArray()
            .flatMap(function (starArray) {
                return Rx.Observable.interval(options.starArray.speed)
                    .map(function () {
                        starArray.forEach(starBehavior);
                        return starArray;
                    });
            }),

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

        canvasClick = Rx.Observable.fromEvent(canvas, "click"),
        spaceBarKeyDown = Rx.Observable.fromEvent(window, "keydown")
            .filter(function (event) {
                return event.keyCode === 32;
            }),
        bulletFiredStream = Rx.Observable.merge(canvasClick, spaceBarKeyDown)
            .startWith({})
            .sample(options.spaceShip.firing.rate)
            .timestamp(),
        bulletStream = Rx.Observable
            .combineLatest(spaceShipPositionStream, bulletFiredStream, function (spaceShipPosition, bulletFired) {
                return {
                    timestamp: bulletFired.timestamp,
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
                    bulletArray.shift();
                }
                return bulletArray;
            }, []),

        scoreStream = options.scoreSubject
            .scan(function (previous, current) {
                return previous + current;
            }, 0),

        gameStreamArray = [optionsSubject, starStream, enemyStream, enemyBulletStream, bulletStream, spaceShipPositionStream, scoreStream],
        gameCombineLatest = function (options, starArray, enemyArray, enemyBulletArray, bulletArray, spaceShipPosition, score) {
            return {
                options: options,
                starArray: starArray,
                enemyArray: enemyArray,
                enemyBulletArray: enemyBulletArray,
                bulletArray: bulletArray,
                spaceShipPosition: spaceShipPosition,
                score: score
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
        var scoreSubject = actors.options.scoreSubject,
            context = actors.options.context;

        paintBackground(context);
        paintStars(actors.starArray, context);
        paintEnemies(actors.enemyArray, actors.enemyBulletArray, context);
        paintEnemyBullets(actors.enemyBulletArray, actors.spaceShipPosition, scoreSubject, context);
        paintBullets(actors.bulletArray, actors.enemyArray, scoreSubject, context);
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

