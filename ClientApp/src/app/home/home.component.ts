import { Component } from '@angular/core';
import { HttpService } from '../services/http/http.service';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private http: HttpService, private storage: StorageService) {
    setInterval(() => {
      this.getAllServices();
    }, 1000);
  }

  getAllServices() {
    this.http
      .POST('events/getByUser', {
        id: this.storage.user.getValue().accountid,
      })
      .subscribe(
        (json) => {
          if (json.erro) {
            console.error('Ocorreu um erro!!');
          }
          this.storage.events.next(json.response);
        },
        (Error) => {}
      );
  }
}
