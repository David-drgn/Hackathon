import { Component, EventEmitter, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "src/app/popUp/login/login.component";
import { RegisterComponent } from "src/app/popUp/register/register.component";

@Component({
  selector: "app-inicial",
  templateUrl: "./inicial.component.html",
  styleUrls: ["./inicial.component.css"],
})
export class InicialComponent {
  sobreView: boolean = true;
  @Output() sobre = new EventEmitter<boolean>();

  menuView: boolean = false;

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

  forgetOpen() {}

  showMenu() {
    this.menuView = !this.menuView
  }

  openDialogRegister(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      data: {
        type: 0,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(result);
      }
    });
  }

  openDialogRegisterEnterprise(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      data: {
        type: 1,
      },
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
