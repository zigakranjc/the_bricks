function showGameOver(time) {
    Swal.fire({
        title: `<div style="margin-top: 12vh; font-family: Arial, sans-serif;">GAME OVER!</div>`,
        html: `<div style= font-family: Arial, sans-serif;>Time played: <b>${time}</b> s</div>`,
        confirmButtonText: "TRY AGAIN",
        confirmButtonColor: "transparent",
        showDenyButton: true,
        denyButtonText: "QUIT",
        denyButtonColor: "gold",
        background: "url(assets/img/sa_bg.png) center / contain  no-repeat",
        customClass: {
            popup: "bigger-swal",
            confirmButton: "sa-btn-image",
            denyButton: "sa-btn-quit",
        },
        color: "white"
    }).then(function (result) {
        if (result.isConfirmed) {
            window.location.reload();
            return;
        }
        if (result.isDenied) {
            try {
                localStorage.removeItem("playerName");
            } catch {
                // ignore
            }
            window.location.reload();
        }
    });
}

window.askPlayerName = function askPlayerName() {
    if (window.Swal && typeof window.Swal.fire === "function") {
        return window.Swal.fire({
            title: "Your name",
            input: "text",
            inputPlaceholder: "Enter name",
            inputAttributes: { autocapitalize: "off", autocomplete: "nickname" },
            confirmButtonText: "OK",
            confirmButtonColor: "gold",
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: "url(assets/img/sa_bg.png) center / contain  no-repeat",
            customClass: { popup: "bigger-swal" },
            color: "white",
            inputValidator: (value) => {
                const safe = String(value ?? "").trim();
                return safe ? undefined : "Please enter a name";
            },
        }).then((res) => String(res.value ?? "").trim());
    }

    return Promise.resolve(String(window.prompt("Your name:") ?? "").trim());
};


let aboutBtn = document.getElementById("aboutBtn");
aboutBtn.addEventListener("click", function () {
    if (window.Swal && typeof window.Swal.fire === "function") {
        window.Swal.fire({
            html: `<div style="padding-top: 15vh; font-size: 30px; font-weight: bold; font-family: Arial, sans-serif;">Žiga Kranjc <br>4. Rb</div>`,
            background: "url(assets/img/sa_bg.png) center / contain  no-repeat",
            customClass: {
                popup: "bigger-swal",
                confirmButton: "sa-btnAbout-image",
            }, 
            confirmButtonText: "",
        }).then(function () {
            window.location.reload();
        });
    }
});

function showWin(time) {
    Swal.fire({
        title: `<div style="margin-top: 12vh; font-family: Arial, sans-serif;">YOU WIN!</div>`,
        html: `<div font-family: Arial, sans-serif;">Time: <b>${time}</b> s</div>`,
        confirmButtonText: "PLAY AGAIN",
        confirmButtonColor: "transparent",
        showDenyButton: true,
        denyButtonText: "QUIT",
        denyButtonColor: "gold",
        background: "url(assets/img/sa_bg.png) center / contain no-repeat",
        customClass: {
            popup: "bigger-swal",
            confirmButton: "sa-btn-image",
            denyButton: "sa-btn-quit",
        },
        color: "white"
    }).then(function (result) {
        if (result.isConfirmed) {
            window.location.reload();
            return;
        }
        if (result.isDenied) {
            if (typeof window.quitToTitle === "function") {
                window.quitToTitle();
                return;
            }
            try {
                localStorage.removeItem("playerName");
            } catch {
                // ignore
            }
            window.location.reload();
        }
    });
}
