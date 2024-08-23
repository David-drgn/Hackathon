import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DialogComponent } from '../dialog/dialog.component';

interface Appointment {
  cliente: {
    descricao: string | null;
    documento: string;
    email: string;
    nome: string;
    redes: string;
    telefone: string;
    foto: string;
  };
  dataAgendada: string; // ISO string
  dataTermino: string; // ISO string
  id: string;
  local: string | null;
  prestador: {
    descricao: string | null;
    documento: string;
    email: string;
    nome: string;
    redes: string;
    telefone: string;
    foto: string;
  };
  tipoHorario: string;
}

interface Redes {
  rede: string;
  url: string;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
})
export class AgendaComponent {
  user: any = null;
  agenda: Appointment | null = null;
  redesAnother: Redes[] = [];

  constructor(
    public dialogRef: MatDialogRef<AgendaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog
  ) {
    this.getEvent();
    this.user = this.storage.user.getValue();
  }

  getEvent() {
    this.http
      .POST('events/getById', {
        id: this.data.id,
      })
      .subscribe((res) => {
        if (res.erro) {
          console.error('Erro na busca');
        } else {
          this.agenda = res.response[0];
          if (this.user.new_tipodaconta == 0) {
            this.redesAnother = JSON.parse(
              this.agenda?.prestador.redes || '[]'
            );
          } else {
            this.redesAnother = JSON.parse(this.agenda?.cliente.redes || '[]');
          }
        }
      });
  }

  close() {
    this.dialogRef.close();
  }

  updateAgenda(updateSelect: number) {
    this.storage.load.next(true);
    this.http
      .POST('agenda/update', {
        idAgenda: this.data.id,
        record: {
          new_tipohorario: updateSelect,
        },
      })
      .subscribe((res) => {
        this.storage.load.next(false);
        if (res.erro) {
          console.error('Erro ao atualizar');
        } else {
          this.openDialog(
            'Sua agenda foi atualizada',
            'Sua agenda foi atualizada com sucesso'
          );
          this.close();
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
}
