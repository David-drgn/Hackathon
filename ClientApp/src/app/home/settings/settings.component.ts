import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage/storage.service';

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
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  user: any;
  evenstActive: Event[] = [];
  evenstDeactive: Event[] = [];

  constructor(private router: Router, private storage: StorageService) {
    this.user = this.storage.user.getValue();
    this.storage.events.subscribe((value) => {
      if (value) {
        this.evenstActive = value.filter(
          (e: Event) => e.type === 'Agendamento' || e.type === 'Agenda Livre'
        );
        this.evenstDeactive = value.filter(
          (e: Event) => e.type !== 'Agendamento' && e.type !== 'Agenda Livre'
        );
      } else {
        this.evenstActive = [];
        this.evenstDeactive = [];
      }
    });
  }

  logout() {
    this.storage.token.next(null);
    this.router.navigate(['/']);
  }
}
