function showGameOver(time) {
    Swal.fire({
        title: `<div style="margin-top: 170px; font-family: Arial, sans-serif;">GAME OVER!</div>`,
        html: `<div style="margin: 200px 0s"; font-family: Arial, sans-serif;>Time played: <b>${time}</b></div>`,
        confirmButtonText: "TRY AGAIN",
        confirmButtonColor: "gold",
        background: "url(assets/img/sweet-alert-bg.png) center / contain  no-repeat",
        customClass: {
            popup: "bigger-swal",
        },
        color: "white"
    }).then(function () {
        window.location.reload();
    });
}

let aboutBtn = document.getElementById("aboutBtn");
aboutBtn.addEventListener("click", function () {
    if (window.Swal && typeof window.Swal.fire === "function") {
        window.Swal.fire({
            html: `<div style="padding-top: 200px; font-size: 30px; font-weight: bold; font-family: Arial, sans-serif;">Žiga Kranjc <br>4. Rb</div>`,
            confirmButtonColor: "gold",
            background: "url(assets/img/sweet-alert-bg.png) center / contain  no-repeat",
            customClass: {
                popup: "bigger-swal",
            },
            showConfirmButton: true,
            confirmButtonText: "OK",
            color: "white"
        }).then(function () {
            window.location.reload();
        });
    }
});

function showWin(time) {
  Swal.fire({
    title: `<div style="margin-top: 170px; font-family: Arial, sans-serif;">YOU WIN!</div>`,
    html: `<div font-family: Arial, sans-serif;">Time: <b>${time}</b></div>`,
    confirmButtonText: "PLAY AGAIN",
    confirmButtonColor: "gold",
    background: "url(assets/img/sweet-alert-bg.png) center / contain no-repeat",
    customClass: {
      popup: "bigger-swal",
    },
    color: "white"
  }).then(function () {
    window.location.reload();
  });
}