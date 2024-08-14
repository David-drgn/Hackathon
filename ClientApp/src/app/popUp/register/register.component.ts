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

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  viewPassword: boolean = true;

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

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {}

  close() {
    this.dialogRef.close();
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
}
