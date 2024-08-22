import { Component, Inject } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { HttpService } from "src/app/services/http/http.service";
import { StorageService } from "src/app/services/storage/storage.service";
import { DialogComponent } from "../dialog/dialog.component";

interface ServiceItem {
  new_name: string;
  new_servicoid: string;
  new_descricao: string;
  accountsRelated: AccountServiceRelation[] | null;
}

interface AccountServiceRelation {
  accountid: string;
  name: string;
}

@Component({
  selector: "app-services",
  templateUrl: "./services.component.html",
  styleUrls: ["./services.component.css"],
})
export class ServicesComponent {
  services: ServiceItem[] = [];
  servicesAux: ServiceItem[] = [];

  searchText: string = "";

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog
  ) {
    this.storage.load.next(true);
    this.getServices();
  }

  getServices() {
    this.http
      .POST("service/get", {
        id: this.storage.user.getValue().accountid,
      })
      .subscribe((res) => {
        this.storage.load.next(false);
        if (res.erro) {
          console.error("Erro");
        } else {
          this.services = res.response.map((item: any) => {
            return {
              new_name: item.new_name,
              new_servicoid: item.new_servicoid,
              new_descricao: item.new_descricao || "Descrição não disponível",
              accountsRelated: item.new_Account_new_Servico_new_Servico || null,
            };
          });

          this.servicesAux = this.services;
        }
      });
  }

  filterMyServices(): ServiceItem[] {
    return this.services.filter((service) =>
      service.accountsRelated?.some(
        (account) =>
          account.accountid === this.storage.user.getValue().accountid
      )
    );
  }

  filterServicesOff(): ServiceItem[] {
    return this.services.filter(
      (service) =>
        !service.accountsRelated?.some(
          (account) =>
            account.accountid === this.storage.user.getValue().accountid
        )
    );
  }

  deleteServiceRelation(serviceId: string) {
    this.storage.load.next(true);
    this.http
      .POST("service/deleteRelation", {
        serviceId,
        accountId: this.storage.user.getValue().accountid,
      })
      .subscribe((res) => {
        if (res.erro) {
          this.openDialog(
            "Ocorreu um erro",
            "Não foi possível deletar o serviço das suas preferências, pro favor, tente novamente"
          );
        } else {
          this.getServices();
        }
      });
  }

  createServiceRelation(serviceId: string) {
    this.storage.load.next(true);
    this.http
      .POST("service/createRelation", {
        serviceId,
        accountId: this.storage.user.getValue().accountid,
      })
      .subscribe((res) => {
        if (res.erro) {
          this.openDialog(
            "Ocorreu um erro",
            "Não foi possível adicionar o serviço das suas preferências, pro favor, tente novamente"
          );
        } else {
          this.getServices();
        }
      });
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

  close() {
    this.dialogRef.close();
  }

  search() {
    if (this.searchText)
      this.services = this.servicesAux.filter((e) =>
        e.new_name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    else this.services = this.servicesAux;
  }
}
