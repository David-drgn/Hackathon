import { Component } from "@angular/core";
import { HttpService } from "../services/http/http.service";
import { StorageService } from "../services/storage/storage.service";
import { canActiveGuard } from "../guards/canActive/can-active.guard";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  private intervalId: any;

  constructor(
    private http: HttpService,
    private storage: StorageService,
    private canActive: canActiveGuard
  ) {
    this.intervalId = setInterval(() => {
      this.getAllServices();
    }, 1000);
  }

  getAllServices() {
    this.http
      .POST("events/getByUser", {
        id: this.storage.user.getValue().accountid,
      })
      .subscribe(
        (json) => {
          if (json.erro) {
            console.error("Ocorreu um erro!!");
            this.canActive.canActivate();
          }
          // console.log(json.response);
          if (this.storage.search.getValue() != "") {
            this.storage.events.next(
              json.response.filter((e: any) =>
                e.title
                  .toLowerCase()
                  .includes(this.storage.search.getValue().toLowerCase())
              )
            );
          } else {
            this.storage.events.next(json.response);
          }
        },
        (Error) => {}
      );
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
