import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { StorageService } from "src/app/services/storage/storage.service";

@Component({
  selector: "app-home-header",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeHeaderComponent {
  pathSelect: string | null = null;

  user: any;

  constructor(private router: Router, private storage: StorageService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.pathSelect = event.url;
    });
    if (this.storage.user.getValue() != null) {
      this.user = this.storage.user.getValue();
    }
    this.storage.user.subscribe((value) => {
      if (value) {
        this.user = value;
      }
    });
  }

  logout() {
    this.storage.token.next(null);
    this.router.navigate(["/"]);
  }

  search(value: string) {
    this.storage.search.next(value);
    console.log(value);
  }
}
