function drawIt() {
  const playBtn = document.getElementById("playBtn");
  let ctx;
  let ball;
  let x;
  let y;
  let dx = 2;
  let dy = 4;
  let r = 15;
  let WIDTH;
  let HEIGHT;
  let paddlex;
  let paddleh;
  let paddlew;
  let paddleBaseW;  //za spreminjanje paddle sirine nazaj na normalno po powerup
  let paddleBoostUntil = 0; //za spreminjanje paddle sirine nazaj na normalno po powerup
  let intervalId;
  let rightDown = false;
  let leftDown = false;
  let bricks;
  let NROWS;
  let NCOLS;
  let BRICKWIDTH;
  let BRICKHEIGHT;
  let PADDING;
  let f = 0;
  let paddlecolor = "#000000";
  let start = true;
  let sekunde = 0;
  let izpisTimer = "00:00";
  let sekundeI, minuteI;
  //element, ki poveča paddleinti
  let drop = {
    x: 0,
    y: -20,
    w: 30,
    h: 30,
    speed: 3,
    active: false,
  };
  const imgMoney = new Image();
  imgMoney.src = "assets/img/money.jpg";
  const imgCoin = new Image();
  imgCoin.src = "assets/img/coin.png";
  let hitBricks = 0;
  const cash = new Audio("assets/sound/kaching.mp3");
  const powerup = new Audio("assets/sound/powerup.mp3");
  const imgDrop = new Image();
  imgDrop.src = "assets/img/drop.png";
  const imgBg = new Image();
  imgBg.src = "assets/img/bg.png";


  function init() {
    if (intervalId) {
      clearInterval(intervalId); // <-- ustavi starega(ko sm refreshu je če ne žogica šla bl hitro)
    }
    ctx = $('#canvas')[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    ball = { x: WIDTH / 2, y: HEIGHT / 2, dx: 2, dy: 4 };
    sekunde = 0;
    izpisTimer = "00:00";
    init_paddle();
    initbricks();
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    intervalId = setInterval(draw, 10);
    return intervalId;
  }

  function initbricks() { //inicializacija opek - polnjenje v tabelo
    let i, j;
    NROWS = 5;
    NCOLS = 9;
    BRICKWIDTH = 74.4;
    BRICKHEIGHT = 30;
    PADDING = 3;
    bricks = new Array(NROWS);
    for (i = 0; i < NROWS; i++) {
      bricks[i] = new Array(NCOLS);
      for (j = 0; j < NCOLS; j++) {
        bricks[i][j] = 1;
      }
    }
  }

  function circle(x, y, r) {
    ctx.drawImage(
      imgCoin,
      x - r, y - r,   // zgornji levi kot
      r * 2, r * 2    // širina, višina
    );
  }

  function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }

  function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
  }

  function init_paddle() {
    paddlex = WIDTH / 2;
    paddleh = 10;
    paddlew = 100;
    paddleBaseW = paddlew;
  }

  function onKeyDown(evt) {
    if (evt.keyCode == 39)
      rightDown = true;
    else if (evt.keyCode == 37)
      leftDown = true;
  }

  function onKeyUp(evt) {
    if (evt.keyCode == 39)
      rightDown = false;
    else if (evt.keyCode == 37)
      leftDown = false;
  }

  function draw() {
    clear();

    //random spuščanje elementa, ki poveča paddle
    if (!drop.active && Math.random() < 0.001) {
      drop.active = true;
      drop.x = Math.random() * (WIDTH - drop.w);
      drop.y = -drop.h;
    }

    if (start == true) {
      sekunde++;
      sekundeI = ((sekundeI = (sekunde % 60)) > 9) ? sekundeI : "0" + sekundeI;
      minuteI = ((minuteI = Math.floor(sekunde / 60)) > 9) ? minuteI : "0" + minuteI;
      izpisTimer = minuteI + ":" + sekundeI;
      $("#cas").html(izpisTimer);
    }

    circle(ball.x, ball.y, r);

    rowheight = BRICKHEIGHT + PADDING + f / 2;
    colwidth = BRICKWIDTH + PADDING + f / 2;

    for (let bi = 0; bi < NROWS; bi++) {
      for (let bj = 0; bj < NCOLS; bj++) {
        if (bricks[bi][bj] !== 1) continue;

        const bx = bj * colwidth + PADDING;
        const by = bi * rowheight + PADDING;
        const nearX = Math.max(bx, Math.min(ball.x, bx + BRICKWIDTH));
        const nearY = Math.max(by, Math.min(ball.y, by + BRICKHEIGHT));
        const dx = ball.x - nearX;
        const dy = ball.y - nearY;

        if (dx * dx + dy * dy < r * r) {
          bricks[bi][bj] = 0;
          Math.abs(dx) < Math.abs(dy) ? ball.dy = -ball.dy : ball.dx = -ball.dx;
          hitBricks++;
          new Audio("assets/sound/hit.mp3").play(); //če bi dal v const bi se slišalo samo enkrat ko bi jih več razbil.

          if (hitBricks == 10 || hitBricks == 20 || hitBricks == 30 || hitBricks == 40) {
            cash.currentTime = 0;
            cash.play();
          }
          if (hitBricks >= 40) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money4.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url(assets/img/mercedes4.png)",
              "background-position": "center"
            });
          } else if (hitBricks >= 30) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money3.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url(assets/img/mercedes3.png)",
              "background-position": "center"
            });
          } else if (hitBricks >= 20) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money2.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url(assets/img/mercedes2.png)",
              "background-position": "center"
            });
          } else if (hitBricks >= 10) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money1.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url(assets/img/mercedes1.png)",
              "background-size": "cover",
              "background-position": "center"
            });
          }
        }
      }
    }

    //preveri če so vse opeke razbite
    function checkWin() {
      for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
          if (bricks[i][j] == 1) return;
        }
      }
      clearInterval(intervalId);
      showWin(izpisTimer);
    }

    if (ball.x + ball.dx > WIDTH - r || ball.x + ball.dx < 0 + r)
      ball.dx = -ball.dx;

    if (ball.y + ball.dy < 0 + r)
      ball.dy = -ball.dy;
    else if (ball.y + ball.dy + r >= HEIGHT - paddleh) {
      start = false;
      if (ball.x + r >= paddlex && ball.x - r <= paddlex + paddlew) {
        ball.dx = 8 * ((ball.x - (paddlex + paddlew / 2)) / paddlew);
        ball.dy = -ball.dy;
        start = true;
      } else if (ball.y - r > HEIGHT) {
        clearInterval(intervalId);
        showGameOver(izpisTimer);
      }

    }

    ball.x += ball.dx;
    ball.y += ball.dy;


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

    ctx.fillStyle = paddlew > paddleBaseW ? "#fec72f" : paddlecolor;
    rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);

    if (paddlew > paddleBaseW) {
      let remaining = Math.max(0, paddleBoostUntil - Date.now()) / 1000;

      if (remaining < 0) remaining = 0;

      $("#powerupTimer").html("POWERUP: " + Math.ceil(remaining) + "s");
      $("#powerupTimer").addClass("active");//da se pojavi
    } else {
      $("#powerupTimer").removeClass("active");//da se odstrani
    }

    //premik in risanje elementa, ki poveča paddle
    if (drop.active) {
      drop.y += drop.speed;
      ctx.drawImage(imgDrop, drop.x, drop.y, drop.w, drop.h);
    }

    //ulov in povečanje paddle
    if (drop.active &&
      drop.y + drop.h >= HEIGHT - paddleh &&
      drop.x + drop.w >= paddlex &&
      drop.x <= paddlex + paddlew) {
      drop.active = false;
      paddlew = paddleBaseW + 50;
      if (paddleBoostUntil > Date.now()) {
        paddleBoostUntil += 7000;
      } else {
        paddleBoostUntil = Date.now() + 7000;
      }
      powerup.currentTime = 0;
      powerup.volume = 0.4;
      powerup.play();
    }

    if (paddlew > paddleBaseW && Date.now() >= paddleBoostUntil) {
      paddlew = paddleBaseW;
    }

    //če element za povečavo paddle pade mimo
    if (drop.active && drop.y > HEIGHT) {
      drop.active = false;
    }

    for (let i = 0; i < NROWS; i++) {
      for (let j = 0; j < NCOLS; j++) {
        if (bricks[i][j] == 1) {
          ctx.drawImage(
            imgMoney,
            (j * (BRICKWIDTH + PADDING)) + PADDING,
            (i * (BRICKHEIGHT + PADDING)) + PADDING,
            BRICKWIDTH, BRICKHEIGHT
          );
        }
      }
    }
    checkWin();
  }
  window.startGame = function () {
    init();
    hitBricks = 0;
    drop.active = false;
    $("#imgLeva, #imgDesna").css("visibility", "hidden");
    playBtn.style.display = "none";
    $("#canvas").css({
      "background-image": "url(assets/img/old-car-bg.jpg)",
      "background-size": "cover",
      "background-position": "center"
    });
  }
  // klik
  playBtn.addEventListener("click", function () {
    startGame();
  });
}
// space tipka
document.addEventListener("keydown", function (evt) {
  if (evt.keyCode === 32) { // 32 = SPACE
    startGame();
  }
});








