import { Component, Inject } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { HttpService } from "src/app/services/http/http.service";
import { StorageService } from "src/app/services/storage/storage.service";
import { DialogComponent } from "../dialog/dialog.component";

interface Rede {
  rede: string;
  url: string;
}
@Component({
  selector: "app-redes",
  templateUrl: "./redes.component.html",
  styleUrls: ["./redes.component.css"],
})
export class RedesComponent {
  redes: Rede[] = [];
  redesAux: Rede[] = [];

  searchText: string = "";

  new_rede_name: string = "";
  new_rede_url: string = "";

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog
  ) {
    this.redes =
      JSON.parse(this.storage.user.getValue().new_redessociais) || [];
  }

  close() {
    this.dialogRef.close();
  }

  search() {}

  createRede() {
    if (!this.new_rede_name || !this.new_rede_url) {
      this.openDialog(
        "Preencha os campos",
        "Não se esqueça que para criar a rede, é necessário o nome da rede social e também, a sua URL de acesso"
      );
    } else {
      if (
        this.redesAux.some(
          (e) =>
            e.rede.toLowerCase() === this.new_rede_name.toLowerCase() &&
            e.url.toLowerCase() === this.new_rede_url.toLowerCase()
        )
      ) {
        this.openDialog(
          "Rede existente",
          "Perdão, mas já existe uma rede com esses caracteres, por favor, crie apenas redes novas"
        );
      } else {
        this.redesAux.push({
          rede: this.new_rede_name,
          url: this.new_rede_url,
        });
        this.redes = this.redesAux;
        this.searchText = "";
      }
    }
  }

  deleteRede(item: Rede) {
    this.redes = this.redesAux.filter((e) => e === item);
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
}
