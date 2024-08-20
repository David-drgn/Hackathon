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
    this.storage.load.subscribe((value) => {
      this.view = value;
    });
  }
}
