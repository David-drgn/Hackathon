import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, map, tap } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { DialogComponent } from "src/app/popUp/dialog/dialog.component";
import { NavigationEnd, Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  token = new BehaviorSubject<any>(null);
  user = new BehaviorSubject<any>(null);
  load = new BehaviorSubject<boolean>(false);

  constructor(private dialog: MatDialog, private router: Router) {
    this.token.next(localStorage.getItem("token"));
    this.token.subscribe((value) => {
      value
        ? localStorage.setItem("token", value)
        : localStorage.removeItem("token");
    });
  }

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: { message, title },
    });
  }
}
