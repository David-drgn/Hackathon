var user;

function logout() {
    localStorage.removeItem("token");
    location.href = "/";
}

function openDialog(title, message, next = null) {
    $("#dialog").empty();
    $(document).ready(function() {
        $("#dialog").load("/pages/PopUp/dialog/alert.html", function() {
            document.getElementById("title_alert").textContent = title;
            document.getElementById("message_alert").textContent = message;
            setTimeout(() => {
                switch (next) {
                    case !null:
                        location.href = `/${next}`;
                        break;
                }
            }, 2800);
        });
    });
}

function activeSearch() {
    document.getElementById("search_text").classList.add("active");
    document.getElementsByClassName("search_view")[0].style.display = "flex";

    let container = document.getElementsByClassName("container");
    if (
        document.getElementsByClassName("help_doctor")[0].style.display == "block"
    )
        for (let i = 0; i < container.length; i++) {
            container[i].style.width = "calc(90% - 120px)";
        }

    document.getElementsByClassName("help_doctor")[0].style.display = "none";
}

function deactiveSearch() {
    document.getElementById("search_text").classList.remove("active");
    document.getElementsByClassName("search_view")[0].style.display = "none";

    if (
        document.getElementById("settings").style.display != "flex" &&
        document.getElementById("archive").style.display != "flex" &&
        document.getElementById("planView").style.display != "flex"
    )
        document.getElementsByClassName("help_doctor")[0].style.display = "block";

    let container = document.getElementsByClassName("container");
    for (let i = 0; i < container.length; i++) {
        container[i].style.width = "";
    }
}

function logout() {
    localStorage.removeItem("token");
    location.href = "/";
}