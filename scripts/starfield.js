/*jslint browser:true */
/*global window, Rx*/
(function (window, document, Rx) {
    "use strict";

    var canvasWidth = window.innerWidth,
        canvasHeight = window.innerHeight,
        canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        speed = 40,
        numberOfStars = 250,
        starStream = Rx.Observable.range(1, numberOfStars)
            .map(function () {
                return {
                    x: parseInt(Math.random() * canvasWidth),//todo: what is better parseInt or Math.floor?
                    y: parseInt(Math.random() * canvasHeight),
                    size: Math.random() * 3 + 1//todo: check the effect if size is not an integer
                };
            })
            .toArray()
            .flatMap(function (starArray) {
                return Rx.Observable.interval(speed)
                    .map(function () {
                        starArray.forEach(function (star) {
                            if (star.y >= canvasHeight) {
                                star.y = 0;
                            }
                            star.y += star.size;
                        });
                        return starArray;
                    });
            })
            .subscribe(function (starArray) {
                function paintStars(starArray, context) {
                    context.fillStyle = "#000000";
                    context.fillRect(0, 0, canvasWidth, canvasHeight);
                    context.fillStyle = "#ffffff";
                    starArray.forEach(function (star) {
                        context.fillRect(star.x, star.y, star.size, star.size);
                    });
                }
                paintStars(starArray, context);
            });


    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    document.body.appendChild(canvas);
} (window, document, Rx));