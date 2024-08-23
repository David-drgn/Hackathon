import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogComponent } from 'src/app/popUp/dialog/dialog.component';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';

interface Plano {
  beneficios: string;
  beneficiosDesc: string;
  desconto: number;
  descricao: string | null;
  id: string;
  plano: string;
  valor: number;
  valorTotal: number;
}

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
})
export class PlansComponent {
  planos: Plano[] = [];

  constructor(
    private storage: StorageService,
    private http: HttpService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.storage.load.next(true);
    this.getPlans();
  }

  getPlans() {
    this.http.GET('getPlan').subscribe(
      (res: any) => {
        this.storage.load.next(false);
        if (res.erro) {
          console.error('Erro ao realizar busca');
        } else {
          this.planos = res.response;
        }
      },
      (Error) => {
        console.error(Error);
      }
    );
  }

  updatePlan(idPlan: string) {
    this.storage.load.next(true);
    this.http
      .UpdateUser({
        userId: this.storage.user.getValue().accountid,
        record: {
          ['new_Plano@odata.bind']: `/new_planos(${idPlan})`,
        },
        email: this.storage.user.getValue().emailaddress1,
      })
      .subscribe((res) => {
        this.storage.load.next(false);
        if (res.erro) {
          this.openDialog(
            'Erro ao atualizar plano',
            'Ocorreu um erro inesperado, ao atualizar plano em sua conta'
          );
        } else {
          this.storage.token.next(res.newToken);
        }
      });
  }

  userPlan(itemId: string): boolean {
    return this.storage.user.getValue().new_Plano.new_planoid == itemId;
  }

  openDialog(title: string, message: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title,
        message,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
}
