function drawIt() {
  let ctx;
  let balls;
  let x;
  let y;
  let dx = 2;
  let dy = 4;
  let r = 10;
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
  let rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
  let paddlecolor = "#000000";
  let ballcolor = "#333333";
  let start = true;
  let sekunde = 0;
  let izpisTimer = "00:00";
  let sekundeI, minuteI;
  //element, ki poveča paddle
  let drop = {
    x: 0,
    y: -20,
    w: 20,
    h: 20,
    speed: 3,
    active: false,
  };
  const imgMoney = new Image();
  imgMoney.src = "img/money.jpg";
  const imgCoin = new Image();
  imgCoin.src = "img/coin.png";


  function init() {
    ctx = $('#canvas')[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    balls = [{ x: WIDTH / 2, y: HEIGHT / 2, dx: 2, dy: 4 }];
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

  function circleDrop(x, y, r) {
    ctx.beginPath();
    ctx.fillStyle = "#0dff00";
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
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

    //random spuščanje elemnta, ki poveča paddle
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
    } else {
      sekunde = 0;
      $("#cas").html(izpisTimer);
    }

    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];
      ctx.fillStyle = ballcolor;
      circle(ball.x, ball.y, r);

      rowheight = BRICKHEIGHT + PADDING + f / 2; // Smo zadeli opeko?
      colwidth = BRICKWIDTH + PADDING + f / 2;
      row = Math.floor(ball.y / rowheight);
      col = Math.floor(ball.x / colwidth);

      // Če smo zadeli opeko, vrni povratno kroglo in označi v tabeli, da opeke ni več
      if (ball.y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
        ball.dy = -ball.dy;
        bricks[row][col] = 0;
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
          balls.splice(i, 1);
          if (balls.length === 0) {
            clearInterval(intervalId);
          }
        }

      }

      ball.x += ball.dx;
      ball.y += ball.dy;
    }

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

    ctx.fillStyle = paddlecolor;
    rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);

    //premik in risanje elementa, ki poveča paddle
    if (drop.active) {
      drop.y += drop.speed;
      circleDrop(drop.x, drop.y, drop.w / 2);
    }

    //ulov in povečanje paddle
    if (drop.active &&
      drop.y + drop.h >= HEIGHT - paddleh &&
      drop.x + drop.w >= paddlex &&
      drop.x <= paddlex + paddlew) {
      drop.active = false;
      paddlew = paddleBaseW + 50;
      paddleBoostUntil = sekunde + 700;
    }

    if (paddlew > paddleBaseW && sekunde >= paddleBoostUntil) {
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
  }
  init();
}






