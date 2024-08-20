import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { LoginComponent } from 'src/app/popUp/login/login.component';
import { RegisterComponent } from 'src/app/popUp/register/register.component';

@Component({
  selector: 'app-inicial',
  templateUrl: './inicial.component.html',
  styleUrls: ['./inicial.component.css'],
})
export class InicialComponent {
  sobreView: boolean = true;
  @Output() sobre = new EventEmitter<boolean>();

  menuView: boolean = false;
  pathSelect: string = '';

  constructor(private dialog: MatDialog, private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.pathSelect = event.url;
    });
  }

  changeViewSobre() {
    this.sobreView = !this.sobreView;
    this.sobre.emit(!this.sobreView);
  }

  forgetOpen() {}

  showMenu() {
    this.menuView = !this.menuView;
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
