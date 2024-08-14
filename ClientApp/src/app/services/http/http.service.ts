import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private httpClient: HttpClient,
    private storage: StorageService
  ) {}

  POST<T = any>(api: string, body: any = {}) {
    body.token = this.storage.token;
    return this.httpClient.post<T>('http://localhost:3000/api/' + api, body);
  }
}
