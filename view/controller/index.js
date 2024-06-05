function view(element) {
  if (element.parentElement.children[0].type == "text") {
    element.parentElement.children[0].type = "password";
    element.src = "./assets/icon/eyeOpen.png";
  } else {
    element.parentElement.children[0].type = "text";
    element.src = "./assets/icon/eyeClose.png";
  }
}

function closeRegister() {
  $(document).ready(function () {
    $("#dialog").empty();
  });
}
