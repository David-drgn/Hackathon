import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DialogComponent } from "src/app/popUp/dialog/dialog.component";
import { RedesComponent } from "src/app/popUp/redes/redes.component";
import { ServicesComponent } from "src/app/popUp/services/services.component";
import { HttpService } from "src/app/services/http/http.service";
import { StorageService } from "src/app/services/storage/storage.service";

interface Event {
  allDay: boolean;
  end: string; // Pode ser um `string` representando a data
  id: string;
  local: string;
  service: string;
  start: string; // Pode ser um `string` representando a data
  title: string;
  type: string;
}

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"],
})
export class SettingsComponent {
  user: any;
  evenstActive: Event[] = [];
  evenstDeactive: Event[] = [];

  constructor(
    private router: Router,
    private storage: StorageService,
    private dialog: MatDialog,
    private http: HttpService
  ) {
    if (this.storage.user.getValue()) this.user = this.storage.user.getValue();
    this.storage.user.subscribe((value) => {
      if (value) {
        this.user = value;
      }
    });
    this.storage.events.subscribe((value) => {
      if (value) {
        this.evenstActive = value.filter(
          (e: Event) => e.type === "Agendamento" || e.type === "Agenda Livre"
        );
        this.evenstDeactive = value.filter(
          (e: Event) => e.type !== "Agendamento" && e.type !== "Agenda Livre"
        );
      } else {
        this.evenstActive = [];
        this.evenstDeactive = [];
      }
    });
  }

  logout() {
    this.storage.token.next(null);
    this.router.navigate(["/"]);
  }

  openServices() {
    return this.dialog.open(ServicesComponent);
  }
  
  openRedes() {
    return this.dialog.open(RedesComponent);
  }

  fileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.includes("image")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.storage.load.next(true);
        const result = e.target?.result;
        if (typeof result === "string") {
          const base64String = result.split(",")[1];

          this.http
            .UpdateUser({
              record: {
                new_perfil: base64String,
              },
              userId: this.storage.user.getValue().accountid,
            })
            .subscribe(
              (res) => {
                this.storage.load.next(false);
                if (res.erro) {
                  this.openDialog(
                    "Erro ao mudar imagem",
                    "Perdão, porém a sua imagem não foi carregada, por favor, tente novamente"
                  );
                } else {
                  this.storage.token.next(res.newToken);
                }
              },
              (Erro) => {
                console.log(Erro);
                this.openDialog(
                  "Erro ao mudar imagem",
                  "Perdão, porém a sua imagem não foi carregada, por favor, tente novamente"
                );
                this.storage.load.next(false);
              }
            );
        }
        // if (!atualiza) {
        // } else {
        //   this.openDialog(
        //     "Erro ao mudar imagem",
        //     "Perdão, porém a sua imagem não foi carregada, por favor, tente novamente"
        //   );
        // }
      };
      reader.readAsDataURL(file);
    } else {
      this.openDialog(
        "Erro ao carregar a imagem",
        "Verifique se o arquivo selecionado realmente é uma imagem"
      );
    }
  }

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: { message, title },
    });
  }
}
