import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CanActivate, Router } from "@angular/router";
import { map, switchMap, tap } from "rxjs";
import { DialogComponent } from "src/app/popUp/dialog/dialog.component";
import { HttpService } from "src/app/services/http/http.service";
import { StorageService } from "src/app/services/storage/storage.service";

@Injectable({
  providedIn: "root",
})
export class canActiveGuard implements CanActivate {
  acesso: boolean = false;

  constructor(
    private storage: StorageService,
    private dialog: MatDialog,
    private http: HttpService,
    private router: Router
  ) {}

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: { message, title },
    });
  }

  canActivate() {
    return this.http.POST("verifyToken").pipe(
      tap((res) => {
        console.log(res);
        if (res) {
          this.storage.user.next(res);
        } else {
          this.openDialog(
            "Realize o login",
            "Por favor, realize o login para prosseguir"
          )
            .afterClosed()
            .subscribe(() => {
              this.router.navigate(["/"]);
            });
        }
      })
    );
  }
}
