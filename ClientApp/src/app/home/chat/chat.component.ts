import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/popUp/dialog/dialog.component';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';

interface Chat {
  role: string;
  content: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  quest: string = '';
  chatView: Chat[] = [];

  constructor(
    private http: HttpService,
    private storage: StorageService,
    private dialog: MatDialog
  ) {
    if (this.storage.chat.getValue().length == 0) {
      this.chat(
        `Olá, quem é você? e qual o seu objetivo? Me chame de ${
          this.storage.user.getValue().name
        }`
      );
    } else {
      this.chatView = this.storage.chat.getValue();
    }
  }

  chat(question = this.quest) {
    if (question) {
      this.http
        .POST('chat/request', {
          question: question,
          id: this.storage.user.getValue().accountid,
        })
        .subscribe((res) => {
          this.quest = '';
          if (res.erro) {
            if (this.chatView.length != 0) {
              this.chatView.push({
                role: 'user',
                content: question,
              });
            }
            this.chatView.push({
              role: 'system',
              content:
                'Perdão, ocorreu um erro no sistema, poderia fazer a pergunta novamente?',
            });
          } else {
            if (this.chatView.length != 0) {
              this.chatView.push({
                role: 'user',
                content: question,
              });
            }
            this.chatView.push({
              role: 'system',
              content: res.anwser,
            });
          }
          this.storage.chat.next(this.chatView);
        });
    } else {
      this.openDialog(
        'Oswald',
        'Não se esqueça de fazer uma pergunta ou mandar uma mensagem para mim'
      );
    }
  }

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: { message, title },
    });
  }
}
