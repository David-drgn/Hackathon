import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { HttpService } from '../services/http/http.service';
import { Router } from '@angular/router';

interface Plano {
  beneficios: string;
  beneficiosDesc: string;
  desconto: number;
  descricao: string | null;
  id: string;
  plano: string;
  valor: number;
  valorTotal: number;
}

@Component({
  selector: 'app-plans-main',
  templateUrl: './plans-main.component.html',
  styleUrls: ['./plans-main.component.css'],
})
export class PlansMainComponent {
  planos: Plano[] = [];

  constructor(
    private storage: StorageService,
    private http: HttpService,
    private router: Router
  ) {
    this.storage.load.next(true);
    this.getPlans();
  }

  getPlans() {
    this.http.GET('getPlan').subscribe(
      (res: any) => {
        this.storage.load.next(false);
        if (res.erro) {
          console.error('Erro ao realizar busca');
        } else {
          this.planos = res.response;
        }
      },
      (Error) => {
        console.error(Error);
      }
    );
  }
}
