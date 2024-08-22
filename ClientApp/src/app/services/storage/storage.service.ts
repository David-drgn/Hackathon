import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, tap } from 'rxjs';
import { Router } from '@angular/router';

interface Chat {
  role: string;
  content: string;
}
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  token = new BehaviorSubject<any>(null);
  user = new BehaviorSubject<any>(null);
  events = new BehaviorSubject<any>(null);

  chat = new BehaviorSubject<Chat[]>([]);

  load = new BehaviorSubject<boolean>(false);

  search = new BehaviorSubject<string>('');

  constructor() {
    this.token.next(localStorage.getItem('token'));
    this.token.subscribe((value) => {
      value
        ? localStorage.setItem('token', value)
        : localStorage.removeItem('token');
    });
  }
}
