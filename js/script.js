function drawIt() {
    var timerId;
    var sekunde;
    var x = 350;
    var y = 230;
    var dx = 2;
    var dy = 4;
    var ctx;
    var r = 15;
    var canvas
    var paddlex;
    var paddleh;
    var paddlew;
    var rightDown = false;
    var leftDown = false;
    var bricks;
    var NROWS;
    var NCOLS;
    var BRICKWIDTH;
    var BRICKHEIGHT;
    var PADDING;
    var intervalId;
    var f = 0;
    var start = true;
    const imgBrick = new Image();
    imgBrick.src = "assets/img/ice_brick.png";
    const imgBrickBroken = new Image();
    imgBrickBroken.src = "assets/img/ice_brick_broken.png";
    const imgSnowBall = new Image();
    imgSnowBall.src = "assets/img/snowball.png";
    const powerup = new Audio("assets/sound/powerup.mp3");
    const imgDrop = new Image();
    imgDrop.src = "assets/img/snowflake_drop.png"

    function init_bricks() { //inicializacija opek - polnjenje v tabelo
        NROWS = 5;
        NCOLS = 9;
        BRICKWIDTH = (WIDTH / NCOLS) - 1;
        BRICKHEIGHT = 40;
        PADDING = 1;
        bricks = new Array(NROWS);
        for (i = 0; i < NROWS; i++) {
            bricks[i] = new Array(NCOLS);
            for (j = 0; j < NCOLS; j++) {
                bricks[i][j] = 1;
            }
        }
    }
    //nastavljanje leve in desne tipke
    function onKeyDown(evt) {
        if (evt.keyCode == 39)
            rightDown = true;
        else if (evt.keyCode == 37) leftDown = true;
        else if (evt.keyCode == 32) restart();
    }

    function onKeyUp(evt) {
        if (evt.keyCode == 39)
            rightDown = false;
        else if (evt.keyCode == 37) leftDown = false;
    }
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

    function restart() {
        clearInterval(intervalId);
        clearInterval(timerId);
        x = 150;
        y = 150;
        dx = 2;
        dy = 4;
        start = true;
        sekunde = 0;
        izpisTimer = "--:--";
        $("#time").html("Time: " + izpisTimer);

        init_bricks();
        init_paddle();
        intervalId = setInterval(draw, 10);
        timerId = setInterval(timer, 1000);
    }

    function draw() {
        clear();
        circle(x, y, r);
        //premik ploščice levo in desno
        if (rightDown) {
            if ((paddlex + paddlew) < WIDTH) {
                paddlex += 5;
            } else {
                paddlex = WIDTH - paddlew;
            }
        }
        else if (leftDown) {
            if (paddlex > 0) {
                paddlex -= 5;
            } else {
                paddlex = 0;
            }
        }
        rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);

        //riši opeke
        for (i = 0; i < NROWS; i++) {
            for (j = 0; j < NCOLS; j++) {
                if (bricks[i][j] == 1) {
                    ctx.drawImage(imgBrick, (j * (BRICKWIDTH + PADDING)) + PADDING,
                        (i * (BRICKHEIGHT + PADDING)) + PADDING,
                        BRICKWIDTH, BRICKHEIGHT);
                }
            }
        }

        rowheight = BRICKHEIGHT + PADDING; //Smo zadeli opeko?
        colwidth = BRICKWIDTH + PADDING;
        row = Math.floor(y / rowheight);
        col = Math.floor(x / colwidth);
        //Če smo zadeli opeko, vrni povratno kroglo in označi v tabeli, da opeke ni več
        if (row >= 0 && row < NROWS && col >= 0 && col < NCOLS && bricks[row][col] == 1) {
            var brickX = col * colwidth + PADDING;
            var brickY = row * rowheight + PADDING;

            if (x - r < brickX || x + r > brickX + BRICKWIDTH) dx = -dx;
            else dy = -dy;

            bricks[row][col] = 0;
        }
        if (x + dx > WIDTH - r || x + dx < r)//levo desno rob canvas
            dx = -dx;
        if (y + dy < 0 + r)//gor rob canvas
            dy = -dy;
        else if (y + dy > HEIGHT - (r + paddleh)) {
            //Odboj kroglice, ki je odvisen od odboja od ploščka 
            if (x > paddlex && x < paddlex + paddlew) {
                dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
                dy = -dy;
                start = true; // teče
            }
            else if (y + dy > HEIGHT) {
                start = false; // ustavi
                clearInterval(intervalId);
                clear();
                showGameOver(izpisTimer).then(function (result) {
                    if (result.isConfirmed) {
                        document.getElementById("playBtn").style.display = "";
                        document.getElementById("playBtn").onclick = function () {
                            document.getElementById("playBtn").style.display = "none";
                            startGame();
                        };
                    } else if (result.isDenied) {
                        askPlayerName().then(function (name) {
                            playerName = name;
                            document.getElementById("playBtn").style.display = "";
                            document.getElementById("playBtn").onclick = function () {
                                document.getElementById("playBtn").style.display = "none";
                                startGame();
                            };
                        });
                    }
                });
            }

        }

        //preveri če smo zmagali
        function checkWin() {
            for (i = 0; i < NROWS; i++) {
                for (j = 0; j < NCOLS; j++) {
                    if (bricks[i][j] == 1) return; //ni še konec
                }
            }
            //vse opeke so uničene
            clearInterval(intervalId);
            clearInterval(timerId);
            start = false;
            saveBestTime();
            clear(); // počisti canvas preden se pokaže swal, ker če ne se zadnja opeka ne izbriše
            showWin(izpisTimer).then(function (result) {
                if (result.isConfirmed) {
                    document.getElementById("playBtn").style.display = "";
                    document.getElementById("playBtn").onclick = function () {
                        document.getElementById("playBtn").style.display = "none";
                        startGame();
                    };
                } else if (result.isDenied) {
                    askPlayerName().then(function (name) {
                        playerName = name;
                        document.getElementById("playBtn").style.display = "";
                        document.getElementById("playBtn").onclick = function () {
                            document.getElementById("playBtn").style.display = "none";
                            startGame();
                        };
                    });
                }
            });
        }
        x += dx;
        y += dy;
        checkWin();
    }
    function init_paddle() {
        paddlex = WIDTH / 2;
        paddleh = 10;
        paddlew = 75;
    }

    function init() {
        ctx = $('#canvas')[0].getContext("2d");
        WIDTH = $("#canvas").width();
        HEIGHT = $("#canvas").height();
        sekunde = 0;
        izpisTimer = "--:--";
    }

    function circle(x, y, r) {
        ctx.drawImage(
            imgSnowBall,
            x - r, y - r,   // zgornji levi kot
            r * 2, r * 2    // širina, višina
        );
    }

    function rect(x, y, w, h) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.closePath();
        ctx.fill();
    }

    function clear() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    function timer() {
        if (start == true) {
            sekunde++;

            sekundeI = ((sekundeI = (sekunde % 60)) > 9) ? sekundeI : "0" + sekundeI;
            minuteI = ((minuteI = Math.floor(sekunde / 60)) > 9) ? minuteI : "0" + minuteI;
            izpisTimer = minuteI + ":" + sekundeI;
            $("#time").html("Time: " + izpisTimer);
        }
    }

    function saveBestTime() {
        let time1 = parseInt(localStorage.getItem("bestTime1")) || Infinity;
        let time2 = parseInt(localStorage.getItem("bestTime2")) || Infinity;
        let time3 = parseInt(localStorage.getItem("bestTime3")) || Infinity;

        var name1 = localStorage.getItem("bestName1") || "";
        var name2 = localStorage.getItem("bestName2") || "";
        var name3 = localStorage.getItem("bestName3") || "";



        if (sekunde < time1) {
            localStorage.setItem("bestTime3", time2);
            localStorage.setItem("bestName3", name2);

            localStorage.setItem("bestTime2", time1);
            localStorage.setItem("bestName2", name1);

            localStorage.setItem("bestTime1", sekunde);
            localStorage.setItem("bestName1", playerName);

        } else if (sekunde < time2) {
            localStorage.setItem("bestTime3", time2);
            localStorage.setItem("bestName3", name2);

            localStorage.setItem("bestTime2", sekunde);
            localStorage.setItem("bestName2", playerName);

        } else if (sekunde < time3) {
            localStorage.setItem("bestTime3", sekunde);
            localStorage.setItem("bestName3", playerName);
        }

        showBestTime(sekunde);

    }

    function showBestTime() {
        var time1 = localStorage.getItem("bestTime1");
        var time2 = localStorage.getItem("bestTime2");
        var time3 = localStorage.getItem("bestTime3");

        var name1 = localStorage.getItem("bestName1");
        var name2 = localStorage.getItem("bestName2");
        var name3 = localStorage.getItem("bestName3");
        if (time1 !== null) {
            document.getElementById("bestTime1").style.visibility = "visible";
            var s = parseInt(time1);
            var sekundeI = ((sekundeI = (s % 60)) > 9) ? sekundeI : "0" + sekundeI;
            var minuteI = ((minuteI = Math.floor(s / 60)) > 9) ? minuteI : "0" + minuteI;
            var izpisBestTime = minuteI + ":" + sekundeI;
            $("#bestTime1").html("1. " + name1 + " - " + izpisBestTime);

        }
        if (time2 !== null) {
            document.getElementById("bestTime2").style.visibility = "visible";
            var s = parseInt(time2);
            var sekundeI = ((sekundeI = (s % 60)) > 9) ? sekundeI : "0" + sekundeI;
            var minuteI = ((minuteI = Math.floor(s / 60)) > 9) ? minuteI : "0" + minuteI;
            var izpisBestTime = minuteI + ":" + sekundeI;
            $("#bestTime2").html("2. " + name2 + " - " + izpisBestTime);

        }
        if (time3 !== null) {
            document.getElementById("bestTime3").style.visibility = "visible";
            var s = parseInt(time3);
            var sekundeI = ((sekundeI = (s % 60)) > 9) ? sekundeI : "0" + sekundeI;
            var minuteI = ((minuteI = Math.floor(s / 60)) > 9) ? minuteI : "0" + minuteI;
            var izpisBestTime = minuteI + ":" + sekundeI;
            $("#bestTime3").html("3. " + name3 + " - " + izpisBestTime);

        }
    }

    showBestTime();

    askPlayerName().then(function (name) {
        playerName = name;

        document.getElementById("playBtn").onclick = function () {
            document.getElementById("playBtn").style.display = "none";
            startGame();
        };
    });

    function resetGame() {
        clearInterval(timerId);
        clearInterval(intervalId);

        x = 350;
        y = 230;
        dx = 2;
        dy = 4;

        sekunde = 0;
        start = true;

        init_bricks();
        init_paddle();
    }

    function startGame() {
        init();
        resetGame();
        timerId = setInterval(timer, 1000);
        intervalId = setInterval(draw, 10);
    }
}