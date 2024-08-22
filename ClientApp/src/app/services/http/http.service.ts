import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { StorageService } from "../storage/storage.service";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  constructor(
    private httpClient: HttpClient,
    private storage: StorageService
  ) {}

  urlBase: string = location.origin.includes("localhost")
    ? "http://localhost:3000"
    : "";

  POST<T = any>(api: string, body: any = {}) {
    body.token = this.storage.token.getValue();
    return this.httpClient.post<T>(`${this.urlBase}/api/${api}`, body);
  }

  GET<T = any>(api: string, body: any = {}) {
    body.token = this.storage.token.getValue();
    return this.httpClient.get<T>(`${this.urlBase}/api/${api}`, body);
  }

  UpdateUser<T = any>(body: any = {}) {
    body.token = this.storage.token.getValue();
    body.email = this.storage.user.getValue().emailaddress1;
    return this.httpClient.post<T>(this.urlBase + "/api/update", body);
  }
}
