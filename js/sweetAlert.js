function showGameOver(time) {
	return Swal.fire({
		title: `<div style="margin-top: 12vh; font-family: Arial, sans-serif;">GAME OVER!</div>`,
		html: `<div style= font-family: Arial, sans-serif;>Time played: <b>${time}</b> s</div>`,
		confirmButtonText: "",
		confirmButtonColor: "transparent",
		showDenyButton: true,
		denyButtonText: "",
		background: "url(assets/img/sa_bg.png) center / contain  no-repeat",
		color: "#03056076",
		customClass: {
			popup: "bigger-swal",
			confirmButton: "sa-btn-try",
			denyButton: "sa-btnQuit-image",
		}
	});
}

window.askPlayerName = function askPlayerName() {
	return window.Swal.fire({
		title: `<div style="margin-top: 12vh; font-family: Arial, sans-serif; color: #03056076;">YOUR NAME</div>`,
		input: "text",
		inputPlaceholder: "Enter name",
		inputAttributes: { autocapitalize: "off", autocomplete: "nickname" },
		confirmButtonText: "",
		allowOutsideClick: false,
		allowEscapeKey: false,
		background: "url(assets/img/sa_bg.png) center / contain  no-repeat",
		color: "white",
		customClass: {
			popup: "bigger-swal",
			input: "sa-name-input",
			confirmButton: "sa-btnAbout-image",
			validationMessage: "sa-validation-msg"
		},
		inputValidator: function (value) {
			if (!value.trim()) return "Please enter a name";
		}
	}).then(function (res) {
		return res.value;
	});
};

let aboutBtn = document.getElementById("aboutBtn");
aboutBtn.addEventListener("click", function () {
	if (window.Swal && typeof window.Swal.fire === "function") {
		window.Swal.fire({
			title: `<div style=" padding-top: 10vh; font-size: 20px; font-family: Arial, sans-serif; color: #03056076;">DEVELOPED BY</div>`,
			html: `<div style="font-size: 30px; font-weight: bold; font-family: Arial, sans-serif;">Žiga Kranjc <br>4. Rb</div>`,
			background: "url(assets/img/sa_bg.png) center / contain  no-repeat",
			color: "#03056076",
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
	return Swal.fire({
		title: `<div style="margin-top: 12vh; font-family: Arial, sans-serif;">YOU WIN!</div>`,
		html: `<div font-family: Arial, sans-serif;">Time: <b>${time}</b> s</div>`,
		confirmButtonText: "",
		confirmButtonColor: "transparent",
		showDenyButton: true,
		denyButtonText: "",
		background: "url(assets/img/sa_bg.png) center / contain no-repeat",
		color: "#03056076",
		customClass: {
			popup: "bigger-swal",
			confirmButton: "sa-btn-play",
			denyButton: "sa-btnQuit-image",
		},
	});
}