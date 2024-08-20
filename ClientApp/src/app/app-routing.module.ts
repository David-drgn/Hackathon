import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { CalendarioComponent } from "./home/calendario/calendario.component";
import { CentralComponent } from "./central/central.component";
import { canActiveGuard } from "./guards/canActive/can-active.guard";
import { ChatComponent } from "./home/chat/chat.component";
import { ArchiveComponent } from "./home/archive/archive.component";
import { PlansComponent } from "./home/plans/plans.component";
import { SettingsComponent } from "./home/settings/settings.component";
import { PlansMainComponent } from "./plans-main/plans-main.component";

const routes: Routes = [
  {
    path: "",
    component: CentralComponent,
  },
  {
    path: "plans",
    component: PlansMainComponent,
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [canActiveGuard],
    children: [
      {
        path: "calendar",
        component: CalendarioComponent,
      },
      {
        path: "chat",
        component: ChatComponent,
      },
      {
        path: "folder",
        component: ArchiveComponent,
      },
      {
        path: "plans",
        component: PlansComponent,
      },
      {
        path: "settings",
        component: SettingsComponent,
      },
    ],
  },
  {
    path: "**",
    component: CentralComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
