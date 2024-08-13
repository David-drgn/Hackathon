import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CalendarioComponent } from './home/calendario/calendario.component';
import { CentralComponent } from './central/central.component';

const routes: Routes = [
  {
    path: '',
    component: CentralComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    // canActivate: ,
    children: [
      {
        path: 'calendar',
        component: CalendarioComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
