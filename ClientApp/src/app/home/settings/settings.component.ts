import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { StorageService } from "src/app/services/storage/storage.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"],
})
export class SettingsComponent {
  user: any;

  constructor(private router: Router, private storage: StorageService) {
    this.user = this.storage.user.getValue();
  }

  logout() {
    this.storage.token.next(null);
    this.router.navigate(["/"]);
  }
}
