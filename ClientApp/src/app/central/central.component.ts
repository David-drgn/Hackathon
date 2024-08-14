import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { DialogComponent } from '../popUp/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from '../popUp/register/register.component';

@Component({
  selector: 'app-central',
  templateUrl: './central.component.html',
  styleUrls: ['./central.component.css'],
})
export class CentralComponent {
  sobreNumber: number = 1;
  sobreView: boolean = false;

  constructor(private dialog: MatDialog) {
    // this.openDialog(
    //   'Teste',
    //   'revelação de que o dialogestá funcionando corretamente sem erro algum',
    //   null
    // );
  }

  changeSobre(position: number) {
    this.sobreNumber = position;
  }

  openDialog(title: string, message: string, returnPage: any): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title,
        message,
        returnPage,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(result);
      }
    });
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
}
