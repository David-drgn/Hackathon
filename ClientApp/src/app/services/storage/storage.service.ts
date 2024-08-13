import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  token = new BehaviorSubject<any>(null);
  load = new BehaviorSubject<boolean>(false);

  constructor() {}
}
