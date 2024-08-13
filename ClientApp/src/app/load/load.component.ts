import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.css'],
})
export class LoadComponent {
  view: boolean = false;

  constructor(private storage: StorageService) {
    setInterval(() => {
      this.view = this.storage.load.getValue();
    }, 10);
  }
}
