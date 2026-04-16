function showGameOver(time) {
    Swal.fire({
        title: "GAME OVER!",
        html: `Time played: <b>${time}</b>`,
        confirmButtonText: "TRY AGAIN",
        confirmButtonColor: "gold",
        background: "url(assets/img/sweet-alert-bg.png) center / contain  no-repeat",
        customClass: {
            popup: "big-swal"
        },
        margin: "3px",
        color: "white"
    }).then(function () {
        window.location.reload();
    });
}