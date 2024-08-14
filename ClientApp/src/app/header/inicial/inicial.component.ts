import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from 'src/app/popUp/login/login.component';
import { RegisterComponent } from 'src/app/popUp/register/register.component';

@Component({
  selector: 'app-inicial',
  templateUrl: './inicial.component.html',
  styleUrls: ['./inicial.component.css'],
})
export class InicialComponent {
  initialView: boolean = true;
  sobreView: boolean = true;
  planosView: boolean = true;
  @Output() sobre = new EventEmitter<boolean>();

  constructor(private dialog: MatDialog) {}

  changeViewSobre() {
    this.sobreView = !this.sobreView;
    this.sobre.emit(!this.sobreView);
  }

  // function showMenu(father) {
  //   let menu = document.getElementById("background_header");
  //   if (menu.style.display == "" || menu.style.display == "none") {
  //     menu.style.display = "block";
  //     setTimeout(() => {
  //       menu.children[0].style.transform = "translateY(0%)";
  //     }, 10);
  //     father.src = "/assets/icon/excluir.png";
  //     father.classList.add("image_rotate");
  //   } else {
  //     menu.children[0].style.transform = "translateY(-105%)";
  //     setTimeout(() => {
  //       menu.style.display = "none";
  //     }, 1000);
  //     father.src = "/assets/icon/cardapio.png";
  //     father.classList.remove("image_rotate");
  //   }
  // }

  loginOpen() {}

  registerEnterpriseOpen() {}

  registerOpen() {}

  forgetOpen() {}

  sobreNos() {
    this.initialView = false;
    this.sobreView = true;
    this.planosView = false;

    // document.getElementsByClassName("sobre_main")[0].style.display = "flex";
    // document.getElementsByClassName("text_main")[0].style.display = "none";
    // document.getElementsByClassName("button_header")[2].style.display = "unset";
    // document.getElementsByClassName("button_header")[1].style.display = "none";

    // document.getElementsByClassName("button_header")[7].style.display = "unset";
    // document.getElementsByClassName("button_header")[6].style.display = "none";
  }

  paginaInicial() {
    this.initialView = false;
    this.sobreView = false;
    this.planosView = true;

    // document.getElementsByClassName("sobre_main")[0].style.display = "none";
    // document.getElementsByClassName("text_main")[0].style.display = "flex";
    // document.getElementsByClassName("button_header")[2].style.display = "none";
    // document.getElementsByClassName("button_header")[1].style.display = "unset";

    // document.getElementsByClassName("button_header")[7].style.display = "none";
    // document.getElementsByClassName("button_header")[6].style.display = "unset";
  }

  showMenu() {
    alert('OI');
  }

  openDialogRegister(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(result);
      }
    });
  }

  openDialogLogin(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(result);
      }
    });
  }
}
