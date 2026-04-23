function drawIt() {
  const playBtn = document.getElementById("playBtn");
  let ctx;
  let ball;
  const ballRadius = 15;
  const initialBallDx = 2;
  const initialBallDy = 4;
  const BEST_TIME_KEY = "bestWinTimeSeconds";
  const BEST_NAME_KEY = "bestWinName";
  const PLAYER_NAME_KEY = "playerName";
  const LEADERBOARD_KEY = "leaderboardV1";
  const LEADERBOARD_LIMIT = 5;
  let hasStarted = false;
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
  let bricksDestroyed = 0;
  //element, ki poveča paddleinti
  let powerupDrop = {
    x: 0,
    y: 0,
    w: 40,
    h: 30,
    speed: 3,
    active: false,
  };

  const imgBrick = new Image();
  imgBrick.src = "assets/img/ice_brick.png";
  const imgBrickBroken = new Image();
  imgBrickBroken.src = "assets/img/ice_brick_broken.png";
  const imgSnowBall = new Image();
  imgSnowBall.src = "assets/img/snowball.png";
  const powerup = new Audio("assets/sound/powerup.mp3");
  const imgDrop = new Image();
  imgDrop.src = "assets/img/snowflake_drop.png";
  const imgBg = new Image();
  imgBg.src = "assets/img/bg.png";

  function setPlayButtonVisible(visible) {
    if (!playBtn) return;
    playBtn.style.display = visible ? "" : "none";
  }

  function parseTimeToSeconds(timeText) {
    // expects "MM:SS"
    const [mm, ss] = String(timeText).split(":");
    const minutes = Number(mm);
    const seconds = Number(ss);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
    return minutes * 60 + seconds;
  }

  function formatSeconds(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function getLeaderboard() {
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const cleaned = parsed
        .map((entry) => ({
          name: String(entry?.name ?? "").trim(),
          seconds: Number(entry?.seconds),
          date: String(entry?.date ?? ""),
        }))
        .filter((entry) => entry.name && Number.isFinite(entry.seconds) && entry.seconds >= 0);
      cleaned.sort((a, b) => a.seconds - b.seconds);
      return cleaned.slice(0, LEADERBOARD_LIMIT);
    } catch {
      return [];
    }
  }

  function setLeaderboard(entries) {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch {
      // ignore (private mode / blocked storage)
    }
  }

  function addLeaderboardEntry(seconds, name) {
    const safeName = String(name ?? "").trim() || "Player";
    const safeSeconds = Number(seconds);
    if (!Number.isFinite(safeSeconds) || safeSeconds < 0) return getLeaderboard();

    const next = [
      ...getLeaderboard(),
      { name: safeName, seconds: Math.floor(safeSeconds), date: new Date().toISOString() },
    ];
    next.sort((a, b) => a.seconds - b.seconds);
    const trimmed = next.slice(0, LEADERBOARD_LIMIT);
    setLeaderboard(trimmed);
    return trimmed;
  }

  function getBestWinTimeSeconds() {
    try {
      const raw = localStorage.getItem(BEST_TIME_KEY);
      if (raw == null) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }

  function getBestWinName() {
    try {
      const raw = localStorage.getItem(BEST_NAME_KEY);
      if (raw == null) return null;
      const name = String(raw).trim();
      return name ? name : null;
    } catch {
      return null;
    }
  }

  function setBestWinTimeSeconds(seconds) {
    try {
      localStorage.setItem(BEST_TIME_KEY, String(seconds));
    } catch {
      // ignore (private mode / blocked storage)
    }
  }

  function setBestWinName(name) {
    try {
      const safe = String(name ?? "").trim();
      if (!safe) return;
      localStorage.setItem(BEST_NAME_KEY, safe);
    } catch {
      // ignore (private mode / blocked storage)
    }
  }

  function getPlayerName() {
    try {
      const raw = localStorage.getItem(PLAYER_NAME_KEY);
      if (raw == null) return null;
      const name = String(raw).trim();
      return name ? name : null;
    } catch {
      return null;
    }
  }

  function setPlayerName(name) {
    try {
      const safe = String(name ?? "").trim();
      if (!safe) return;
      localStorage.setItem(PLAYER_NAME_KEY, safe);
    } catch {
      // ignore (private mode / blocked storage)
    }
  }

  window.quitToTitle = function quitToTitle() {
    try {
      localStorage.removeItem(PLAYER_NAME_KEY);
    } catch {
      // ignore (private mode / blocked storage)
    }
    window.location.reload();
  };

  function ensurePlayerName() {
    const existing = getPlayerName();
    if (existing) return Promise.resolve(existing);

    const ask =
      typeof window.askPlayerName === "function"
        ? window.askPlayerName
        : () => Promise.resolve(String(window.prompt("Your name:") ?? "").trim());

    return Promise.resolve()
      .then(() => ask())
      .then((name) => {
        const safe = String(name ?? "").trim();
        const finalName = safe || "Player";
        setPlayerName(finalName);
        return getPlayerName() ?? finalName;
      });
  }



  function updateBestTimeUI() {
    const best = getBestWinTimeSeconds();
    const name = getBestWinName();

    const fallback = String(window.prompt("Your name:") ?? "").trim();
    if (fallback) setPlayerName(fallback);
    return Promise.resolve(getPlayerName() ?? fallback);
  }

  function updateBestTimeUI() {
    const best = getBestWinTimeSeconds();
    const name = getBestWinName();
    $("#bestTime").html(
      best == null
        ? "BEST: --:--"
        : name
          ? `BEST: ${formatSeconds(best)} (${name})`
          : `BEST: ${formatSeconds(best)}`
    );
  }

  function renderLeaderboard() {
    const $list = $("#leaderboardList");
    if (!$list.length) return;

    const entries = getLeaderboard();
    $list.empty();

    if (entries.length === 0) {
      $list.append($("<li>").addClass("lb-empty").text("No records yet"));
      return;
    }

    entries.forEach((entry, index) => {
      const $row = $("<li>").addClass("lb-row").toggleClass("is-first", index === 0);
      $row.append($("<span>").addClass("lb-rank").text(`#${index + 1}`));
      $row.append($("<span>").addClass("lb-name").text(entry.name));
      $row.append($("<span>").addClass("lb-time").text(`${formatSeconds(entry.seconds)}\u00A0s`));
      $list.append($row);
    });
  }

  function updateScoreUI() {
    if (!$("#score").length) return;
    $("#score").html(`SCORE: ${bricksDestroyed}`);
  }

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
    isTimerRunning = true;
    bricksDestroyed = 0;
    powerupDrop.active = false;
    paddleBoostUntil = 0;
    $("#time").html(timerText);
    updateScoreUI();
    updateBestTimeUI();
    renderLeaderboard();
    init_paddle();
    initbricks();
    $(document)
      .off("keydown.bricks", onKeyDown)
      .off("keyup.bricks", onKeyUp)
      .on("keydown.bricks", onKeyDown)
      .on("keyup.bricks", onKeyUp);
    gameLoopId = setInterval(draw, 10);
    return gameLoopId;
  }

  function initbricks() { //inicializacija opek - polnjenje v tabelo
    let i, j;
    brickRows = 5;
    brickCols = 9;
    brickWidth = 74.5;
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
      ctx.shadowColor = "white";
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
      $("#time").html(timerText);
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
            bricksDestroyed++;
            updateScoreUI();
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

      const current = parseTimeToSeconds(timerText);
      if (current != null) {
        addLeaderboardEntry(current, getPlayerName() ?? "Player");
        renderLeaderboard();

        const best = getBestWinTimeSeconds();
        if (best == null || current < best) {
          setBestWinTimeSeconds(current);
          setBestWinName(getPlayerName() ?? "Player");
        }
      }
      updateBestTimeUI();

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

    const isPaddleBoosted = paddleWidth > paddleBaseWidth;

    ctx.save();

    if (isPaddleBoosted) {
      const now = Date.now();
      const pulse = (Math.sin(now / 120) + 1) / 2; // 0..1
      const alpha = 0.25 + pulse * 0.55;

      // glow behind paddle (more visible than relying on shadow alone)
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 10 + pulse * 24;
      rect(paddleX - 2, canvasHeight - paddleHeight - 2, paddleWidth + 4, paddleHeight + 4);

      // reset shadow for the actual paddle fill
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = paddlecolor;
    rect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);

    ctx.restore();

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

  let onStartKeyDown = null;

  function startGame() {
    if (hasStarted) return;
    ensurePlayerName().then(() => {
      if (hasStarted) return;
      hasStarted = true;
      setPlayButtonVisible(false);
      init();
      if (onStartKeyDown) document.removeEventListener("keydown", onStartKeyDown);
    });
  }

  if (playBtn) {
    setPlayButtonVisible(true);
    playBtn.addEventListener("click", startGame, { once: true });

    onStartKeyDown = (evt) => {
      if (hasStarted) return;
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        startGame();
      }
    };
    document.addEventListener("keydown", onStartKeyDown);
  } else {
    // fallback: if the button is missing, keep old behavior
    init();
  }

  ensurePlayerName();
  updateScoreUI();
  renderLeaderboard();
}
