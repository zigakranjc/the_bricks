function drawIt() {
  const playBtn = document.getElementById("playBtn");
  let ctx;
  let ball;
  const ballRadius = 15;
  const initialBallDx = 2;
  const initialBallDy = 4;
  let canvasWidth;
  let canvasHeight;
  let paddleX;
  let paddleHeight;
  let paddleWidth;
  let paddleBaseWidth; // za spreminjanje paddle sirine nazaj na normalno po powerup
  let paddleBoostUntil = 0; // za spreminjanje paddle sirine nazaj na normalno po powerup
  let gameLoopId;
  let isRightPressed = false;
  let isLeftPressed = false;
  let brickGrid;
  let brickRows;
  let brickCols;
  let brickWidth;
  let brickHeight;
  let brickPadding;
  let spacingFactor = 0;
  // some bricks need two hits
  const TOUGH_BRICK_HITS = 2;
  const TOUGH_BRICK_COUNT = 15;
  let paddlecolor = "white";
  let isTimerRunning = true;
  let timerTicks = 0;
  let timerText = "00:00";
  let secondsText, minutesText;
  //element, ki poveča paddleinti
  let powerupDrop = {
    x: 0,
    y: -20,
    w: 30,
    h: 30,
    speed: 3,
    active: false,
  };
  
  const imgBrick= new Image();
  imgBrick.src = "assets/img/ice_brick.png";
  const imgBrickBroken= new Image();
  imgBrickBroken.src = "assets/img/ice_brick_broken.png";
  const imgSnowBall = new Image();
  imgSnowBall.src = "assets/img/snowball.png";
  let hitBricks = 0;
  const cash = new Audio("assets/sound/kaching.mp3");
  const powerup = new Audio("assets/sound/powerup.mp3");
  const imgDrop = new Image();
  imgDrop.src = "assets/img/drop.png";
  const imgBg = new Image();
  imgBg.src = "assets/img/bg.png";

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function init() {
    if (gameLoopId) {
      clearInterval(gameLoopId); // <-- ustavi starega(ko sm refreshu je če ne žogica šla bl hitro)
    }
    ctx = $('#canvas')[0].getContext("2d");
    canvasWidth = $("#canvas").width();
    canvasHeight = $("#canvas").height();
    ball = { x: canvasWidth / 2, y: canvasHeight / 2, dx: initialBallDx, dy: initialBallDy };
    timerTicks = 0;
    timerText = "00:00";
    init_paddle();
    initbricks();
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    gameLoopId = setInterval(draw, 10);
    return gameLoopId;
  }

  function initbricks() { //inicializacija opek - polnjenje v tabelo
    let i, j;
    brickRows = 5;
    brickCols = 13;
    brickWidth = 50;
    brickHeight = 40;
    brickPadding = 3;

    const positions = [];
    for (i = 0; i < brickRows; i++) {
      for (j = 0; j < brickCols; j++) {
        positions.push([i, j]);
      }
    }
    shuffleInPlace(positions);
    const toughPositions = new Set(
      positions.slice(0, TOUGH_BRICK_COUNT).map(([row, col]) => `${row},${col}`)
    );

    brickGrid = new Array(brickRows);
    for (i = 0; i < brickRows; i++) {
      brickGrid[i] = new Array(brickCols);
      for (j = 0; j < brickCols; j++) {
        const isTough = toughPositions.has(`${i},${j}`);
        brickGrid[i][j] = {
          hp: isTough ? TOUGH_BRICK_HITS : 1,
          maxHp: isTough ? TOUGH_BRICK_HITS : 1,
        };
      }
    }
  }

  function circle(x, y, r) {
    ctx.drawImage(
      imgSnowBall,
      x - r, y - r,   // zgornji levi kot
      r * 2, r * 2    // širina, višina
    );
  }

  function clear() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
  }

  function drawBrick(x, y, brick) {
    ctx.save();

    const isTough = brick.maxHp >= TOUGH_BRICK_HITS;

    // 2HP bricks: shadow (before first hit)
    if (isTough && brick.hp >= TOUGH_BRICK_HITS) {
      ctx.shadowColor = "rgba(0, 180, 255, 0.85)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    const brickImage = (isTough && brick.hp === 1) ? imgBrickBroken : imgBrick;
    ctx.drawImage(brickImage, x, y, brickWidth, brickHeight);
    ctx.shadowBlur = 0;

    
    ctx.restore();
  }

  function init_paddle() {
    paddleX = canvasWidth / 2;
    paddleHeight = 10;
    paddleWidth = 100;
    paddleBaseWidth = paddleWidth;
  }

  function onKeyDown(evt) {
    if (evt.keyCode == 39)
      isRightPressed = true;
    else if (evt.keyCode == 37)
      isLeftPressed = true;
  }

  function onKeyUp(evt) {
    if (evt.keyCode == 39)
      isRightPressed = false;
    else if (evt.keyCode == 37)
      isLeftPressed = false;
  }

  function draw() {
    clear();

    //random spuščanje elementa, ki poveča paddle
    if (!powerupDrop.active && Math.random() < 0.001) {
      powerupDrop.active = true;
      powerupDrop.x = Math.random() * (canvasWidth - powerupDrop.w);
      powerupDrop.y = -powerupDrop.h;
    }

    if (isTimerRunning == true) {
      timerTicks++;
      secondsText = ((secondsText = (timerTicks % 60)) > 9) ? secondsText : "0" + secondsText;
      minutesText = ((minutesText = Math.floor(timerTicks / 60)) > 9) ? minutesText : "0" + minutesText;
      timerText = minutesText + ":" + secondsText;
      $("#cas").html(timerText);
    }

    circle(ball.x, ball.y, ballRadius);

    let rowHeight = brickHeight + brickPadding + spacingFactor / 2;
    let colWidth = brickWidth + brickPadding + spacingFactor / 2;

    for (let bi = 0; bi < brickRows; bi++) {
      for (let bj = 0; bj < brickCols; bj++) {
        if (brickGrid[bi][bj].hp <= 0) continue;

        const bx = bj * colWidth + brickPadding;
        const by = bi * rowHeight + brickPadding;
        const nearX = Math.max(bx, Math.min(ball.x, bx + brickWidth));
        const nearY = Math.max(by, Math.min(ball.y, by + brickHeight));
        const dx = ball.x - nearX;
        const dy = ball.y - nearY;

        if (dx * dx + dy * dy < ballRadius * ballRadius) {
          brickGrid[bi][bj].hp--;
          Math.abs(dx) < Math.abs(dy) ? ball.dy = -ball.dy : ball.dx = -ball.dx;
          new Audio("assets/sound/hit.mp3").play(); //če bi dal v const bi se slišalo samo enkrat ko bi jih več razbil.

          if (brickGrid[bi][bj].hp === 0) {
            hitBricks++;
          }

          if (hitBricks == 10 || hitBricks == 20 || hitBricks == 30 || hitBricks == 40) {
            cash.currentTime = 0;
            cash.play();
          }
          if (hitBricks >= 40) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money4.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url()",
              "background-position": "center"
            });
          } else if (hitBricks >= 30) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money3.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url()",
              "background-position": "center"
            });
          } else if (hitBricks >= 20) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money2.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url()",
              "background-position": "center"
            });
          } else if (hitBricks >= 10) {
            $("#imgLeva, #imgDesna").attr("src", "assets/img/money1.png").css("visibility", "visible");
            $("#canvas").css({
              "background-image": "url()",
              "background-size": "cover",
              "background-position": "center"
            });
          }
        }
      }
    }

    //preveri če so vse opeke razbite
    function checkWin() {
      for (let i = 0; i < brickRows; i++) {
        for (let j = 0; j < brickCols; j++) {
          if (brickGrid[i][j].hp > 0) return;
        }
      }
      clearInterval(gameLoopId);
      showWin(timerText);
    }

    if (ball.x + ball.dx > canvasWidth - ballRadius || ball.x + ball.dx < 0 + ballRadius)
      ball.dx = -ball.dx;

    if (ball.y + ball.dy < 0 + ballRadius)
      ball.dy = -ball.dy;
    else if (ball.y + ball.dy + ballRadius >= canvasHeight - paddleHeight) {
      isTimerRunning = false;
      if (ball.x + ballRadius >= paddleX && ball.x - ballRadius <= paddleX + paddleWidth) {
        ball.dx = 8 * ((ball.x - (paddleX + paddleWidth / 2)) / paddleWidth);
        ball.dy = -ball.dy;
        isTimerRunning = true;
      } else if (ball.y - ballRadius > canvasHeight) {
        clearInterval(gameLoopId);
        showGameOver(timerText);
      }

    }

    ball.x += ball.dx;
    ball.y += ball.dy;


    //premik ploščice levo in desno
    if (isRightPressed) {
      if ((paddleX + paddleWidth) < canvasWidth) {
        paddleX += 5;
      } else {
        paddleX = canvasWidth - paddleWidth;
      }
    }
    else if (isLeftPressed) {
      if (paddleX > 0) {
        paddleX -= 5;
      } else {
        paddleX = 0;
      }
    }

    ctx.fillStyle = paddleWidth > paddleBaseWidth ? "#fec72f" : paddlecolor;
    rect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);

    if (paddleWidth > paddleBaseWidth) {
      let remaining = Math.max(0, paddleBoostUntil - Date.now()) / 1000;

      if (remaining < 0) remaining = 0;

      $("#powerupTimer").html("POWERUP: " + Math.ceil(remaining) + "s");
      $("#powerupTimer").addClass("active");//da se pojavi
    } else {
      $("#powerupTimer").removeClass("active");//da se odstrani
    }

    //premik in risanje elementa, ki poveča paddle
    if (powerupDrop.active) {
      powerupDrop.y += powerupDrop.speed;
      ctx.drawImage(imgDrop, powerupDrop.x, powerupDrop.y, powerupDrop.w, powerupDrop.h);
    }

    //ulov in povečanje paddle
    if (powerupDrop.active &&
      powerupDrop.y + powerupDrop.h >= canvasHeight - paddleHeight &&
      powerupDrop.x + powerupDrop.w >= paddleX &&
      powerupDrop.x <= paddleX + paddleWidth) {
      powerupDrop.active = false;
      paddleWidth = paddleBaseWidth + 50;
      if (paddleBoostUntil > Date.now()) {
        paddleBoostUntil += 7000;
      } else {
        paddleBoostUntil = Date.now() + 7000;
      }
      powerup.currentTime = 0;
      powerup.volume = 0.4;
      powerup.play();
    }

    if (paddleWidth > paddleBaseWidth && Date.now() >= paddleBoostUntil) {
      paddleWidth = paddleBaseWidth;
    }

    //če element za povečavo paddle pade mimo
    if (powerupDrop.active && powerupDrop.y > canvasHeight) {
      powerupDrop.active = false;
    }

    for (let i = 0; i < brickRows; i++) {
      for (let j = 0; j < brickCols; j++) {
        const brick = brickGrid[i][j];
        if (brick.hp > 0) {
          drawBrick(
            (j * (brickWidth + brickPadding)) + brickPadding,
            (i * (brickHeight + brickPadding)) + brickPadding,
            brick
          );
        }
      }
    }
    checkWin();
  }

  init();
}







