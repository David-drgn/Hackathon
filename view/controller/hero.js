document.getElementById("consultar").addEventListener("click", function () {
  if (
    this.children[1].style.display == "" ||
    this.children[1].style.display == "none"
  ) {
    this.children[1].style.display = "flex";
    this.children[2].style.display = "flex";
    this.style.background =
      "linear-gradient(rgb(127, 155, 205), rgb(127 156 205 / 50%))";
    this.parentElement.style.padding = "20px 20px 0px 20px";
    this.parentElement.style.justifyContent = "end";
    this.style.paddingBottom = "50px";
    this.style.borderBottomLeftRadius = "0px";
    this.style.borderBottomRightRadius = "0px";
    this.style.height = "35%";
  } else {
    this.style.paddingBottom = "10px";
    this.style.background = "rgb(127, 155, 205)";
    this.parentElement.style.padding = "10px 20px";
    this.parentElement.style.justifyContent = "center";
    this.style.borderBottomLeftRadius = "30px";
    this.style.borderBottomRightRadius = "30px";
    this.style.height = "auto";
    this.children[1].style.display = "none";
    this.style.background = "#7F9BCD";
    this.children[2].style.display = "none";
  }
});

function changeSobre(position) {
  let btn = document.getElementsByClassName("buttons_sobre_main");
  let text = document.getElementsByClassName("text_sobre_main");
  for (let i = 0; i < btn.length; i++) {
    let element = btn[i];
    let elementText = text[i];
    element.classList.remove("active");
    elementText.style.display = "none";
    if (i == position) {
      element.classList.add("active");
      elementText.style.display = "unset";
    }
  }
}
