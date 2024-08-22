import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { DialogComponent } from '../popUp/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from '../popUp/register/register.component';
import { StorageService } from '../services/storage/storage.service';
import { HttpService } from '../services/http/http.service';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-central',
  templateUrl: './central.component.html',
  styleUrls: ['./central.component.css'],
})
export class CentralComponent {
  sobreNumber: number = 1;
  sobreView: boolean = false;

  constructor(
    private dialog: MatDialog,
    private storage: StorageService,
    private http: HttpService,
    private router: Router
  ) {
    if (this.storage.token.getValue()) {
      this.http.POST('verifyToken').subscribe((res) => {
        if (res) {
          this.storage.user.next(res);
          this.router.navigate(['/home/calendar']);
        } else {
          this.openDialog(
            'Realize o login',
            'O seu acesso expirou, por favor, realize o login novamente'
          )
            .afterClosed()
            .subscribe(() => {
              this.router.navigate(['/']);
            });
        }
      });
    }
  }

  changeSobre(position: number) {
    this.sobreNumber = position;
  }

  openDialog(title: string, message: string, returnPage: any = null) {
    return this.dialog.open(DialogComponent, {
      data: {
        title,
        message,
        returnPage,
      },
    });
  }

  openDialogRegister() {
    return this.dialog.open(RegisterComponent, {
      data: {
        type: 0,
      },
    });
  }
}
