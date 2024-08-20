import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { HttpClientModule } from "@angular/common/http";

import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import { FullCalendarModule } from "@fullcalendar/angular";
import { ReactiveFormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CentralComponent } from './central/central.component';
import { HomeComponent } from './home/home.component';
import { HomeHeaderComponent } from './header/home/home.component';
import { InicialComponent } from './header/inicial/inicial.component';
import { CalendarioComponent } from './home/calendario/calendario.component';
import { RegisterComponent } from './popUp/register/register.component';
import { LoginComponent } from './popUp/login/login.component';
import { ForgetComponent } from './popUp/forget/forget.component';
import { RedesComponent } from './popUp/redes/redes.component';
import { InfoComponent } from './popUp/info/info.component';
import { LoadComponent } from './load/load.component';
import { DialogComponent } from './popUp/dialog/dialog.component';
import { ChatComponent } from './home/chat/chat.component';
import { ArchiveComponent } from './home/archive/archive.component';
import { PlansComponent } from './home/plans/plans.component';
import { SettingsComponent } from './home/settings/settings.component';
import { EventViewComponent } from './home/event-view/event-view.component';
import { FilterPipe } from './pipes/filter/filter.pipe';
import { PlansMainComponent } from './plans-main/plans-main.component';
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    CentralComponent,
    HomeComponent,
    InicialComponent,
    CalendarioComponent,
    RegisterComponent,
    LoginComponent,
    ForgetComponent,
    RedesComponent,
    InfoComponent,
    LoadComponent,
    DialogComponent,
    HomeHeaderComponent,
    ChatComponent,
    ArchiveComponent,
    PlansComponent,
    SettingsComponent,
    EventViewComponent,
<<<<<<< HEAD
    FilterPipe,
    PlansMainComponent,
=======
    EventComponent,
>>>>>>> 149619ffdfe9ead580bbcef3567759f95baa0941
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    FullCalendarModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ReactiveFormsModule,
    MatTooltipModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [provideNgxMask()],
  bootstrap: [AppComponent],
})
export class AppModule {}
