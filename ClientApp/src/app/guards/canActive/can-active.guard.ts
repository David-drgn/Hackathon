import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class canActiveGuard implements CanActivate {
  acesso: boolean = false;

  constructor(
    private storage: StorageService,
    // private dialog: MatDialog,
    private http: HttpService,
    private router: Router
  ) {}

  // openDialog(title: string, message: string, campos: string[] = []) {
  //   this.dialog.open(DialogComponent, {
  //     data: {
  //       view: 'alert',
  //       message: message,
  //       title: title,
  //       campos: campos,
  //     },
  //   });
  // }

  canActivate(): boolean {
    console.log(this.storage.token.getValue());
    if (!this.storage.token.getValue()) {
      // this.openDialog(
      //   'Login',
      //   'Por favor realize o login antes de realizar a ação'
      // );
      this.router.navigate(['./perfil']);
      return false;
    }
    return true;
  }
}
