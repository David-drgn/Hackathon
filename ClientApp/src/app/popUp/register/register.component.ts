import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogComponent } from '../dialog/dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';

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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  viewPassword: boolean = true;

  planos: Plano[] = [];

  formUser = this.formBuilder.group({
    nome: ['', Validators.required],
    email: ['', Validators.required],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[A-Z]/), // letra maiúscula
        Validators.pattern(/[a-z]/), // letra minúscula
        Validators.pattern(/[0-9]/), // número
        Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/), // caracter especial
      ],
    ],
    confirm: ['', Validators.required],
    telephone: ['', Validators.required],
    document: ['', Validators.required],
  });

  formEnterprise = this.formBuilder.group({
    nome: ['', Validators.required],
    email: ['', Validators.required],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[A-Z]/), // letra maiúscula
        Validators.pattern(/[a-z]/), // letra minúscula
        Validators.pattern(/[0-9]/), // número
        Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/), // caracter especial
      ],
    ],
    confirm: ['', Validators.required],
    telephone: ['', Validators.required],
    document: ['', Validators.required],
    plan: ['', Validators.required],
  });

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {}

  ngAfterViewInit() {
    if (this.data.type == 1) {
      this.storage.load.next(true);
      this.getPlans();
    }
  }

  close() {
    this.dialogRef.close();
  }

  registerEnterprise() {
    if (this.formEnterprise.invalid) {
      this.openDialog(
        'Preencher todos os campos',
        'Para realizar a ação, é necessário que você preencha todos os campos corretamente'
      );
    } else if (
      this.formEnterprise.controls.password.value !=
      this.formEnterprise.controls.confirm.value
    ) {
      this.openDialog(
        'Preencher todos os campos',
        'Para realizar a ação, é necessário que você preencha senha e confirmar senha de maneira igual'
      );
    } else {
      this.storage.load.next(true);
      this.http
        .POST('sendMail', {
          email: this.formEnterprise.controls.email.value,
          name: this.formEnterprise.controls.nome.value,
          dataUser: {
            name: this.formEnterprise.controls.nome.value,
            email: this.formEnterprise.controls.email.value,
            password: this.formEnterprise.controls.password.value,
            telephone: this.formEnterprise.controls.telephone.value,
            document: this.formEnterprise.controls.document.value,
            plan: this.formEnterprise.controls.plan.value,
          },
          type: 0,
        })
        .subscribe((res) => {
          this.storage.load.next(false);
          if (res.erro) {
            this.openDialog(
              'Erro',
              'Algo deu errado, por favor, tente novamente mais tarde'
            );
          } else {
            this.openDialog(
              'Email enviado!!',
              'Para realizar o login, por favor, entre no link enviado ao seu email'
            );
            this.close();
          }
        });
    }
  }

  registerUser() {
    if (this.formUser.invalid) {
      this.openDialog(
        'Preencher todos os campos',
        'Para realizar a ação, é necessário que você preencha todos os campos corretamente'
      );
    } else if (
      this.formUser.controls.password.value !=
      this.formUser.controls.confirm.value
    ) {
      this.openDialog(
        'Preencher todos os campos',
        'Para realizar a ação, é necessário que você preencha senha e confirmar senha de maneira igual'
      );
    } else {
      this.storage.load.next(true);
      this.http
        .POST('sendMail', {
          email: this.formUser.controls.email.value,
          name: this.formUser.controls.nome.value,
          dataUser: {
            name: this.formUser.controls.nome.value,
            email: this.formUser.controls.email.value,
            password: this.formUser.controls.password.value,
            telephone: this.formUser.controls.telephone.value,
            document: this.formUser.controls.document.value,
          },
          type: 0,
        })
        .subscribe((res) => {
          this.storage.load.next(false);
          if (res.erro) {
            this.openDialog(
              'Erro',
              'Algo deu errado, por favor, tente novamente mais tarde'
            );
          } else {
            this.openDialog(
              'Email enviado!!',
              'Para realizar o login, por favor, entre no link enviado ao seu email'
            );
            this.close();
          }
        });
    }
  }

  openDialog(title: string, message: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title,
        message,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  getPlans() {
    this.http.GET('getPlan').subscribe(
      (res: any) => {
        this.storage.load.next(false);
        if (res.erro) {
          console.error('Erro ao realizar busca');
        } else {
          this.planos = res.response;
          this.formEnterprise.controls.plan.setValue(this.data.plan);
        }
      },
      (Error) => {
        console.error(Error);
      }
    );
  }
}
