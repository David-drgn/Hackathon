import { Component, Inject } from '@angular/core';
import { RegisterComponent } from '../register/register.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ForgetComponent } from '../forget/forget.component';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DialogComponent } from '../dialog/dialog.component';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  viewPassword: boolean = true;

  form = this.formBuilder.group({
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
    check: [false],
  });

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  close() {
    this.dialogRef.close();
  }

  openDialogRegister(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(result);
      }
    });
  }

  openDialogForget(): void {
    const dialogRef = this.dialog.open(ForgetComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(result);
      }
    });
  }

  openDialog(title: string, message: string, routerLink: any = null): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title,
        message,
        routerLink,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(result);
      }
    });
  }

  login() {
    if (this.form.invalid) {
      this.openDialog(
        'Preencha todos os campos',
        'Por favor, preencha todos os campos corretamente'
      );
    } else {
      this.storage.load.next(true);
      this.http.POST('login', this.form.value).subscribe(
        async (res: any) => {
          console.log(res);
          this.storage.load.next(false);
          this.storage.load.next(false);
          if (res.erro) {
            this.openDialog(
              'Login incorreto',
              'Por favor, coloque uma senha ou email corretos'
            );
            return;
          }
          localStorage.setItem('token', res.token);
          console.log(localStorage.getItem('token'));
          this.close();
          this.router.navigate(['./home/calendar']);
        },
        (Error) => {
          this.storage.load.next(false);
          this.openDialog(
            'Login incorreto',
            'Por favor, coloque uma senha ou email corretos'
          );
        }
      );
    }
  }
}
