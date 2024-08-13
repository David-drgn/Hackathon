import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CentralComponent } from './central/central.component';
import { HomeComponent } from './home/home.component';
import { InicialComponent } from './header/inicial/inicial.component';
import { CalendarioComponent } from './home/calendario/calendario.component';
import { RegisterComponent } from './popUp/register/register.component';
import { LoginComponent } from './popUp/login/login.component';
import { ForgetComponent } from './popUp/forget/forget.component';
import { ServiceComponent } from './popUp/service/service.component';
import { RedesComponent } from './popUp/redes/redes.component';
import { InfoComponent } from './popUp/info/info.component';
import { LoadComponent } from './load/load.component';

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
    ServiceComponent,
    RedesComponent,
    InfoComponent,
    LoadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
