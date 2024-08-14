import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent {
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
  });

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog
  ) {
    setTimeout(() => {
      this.dialogRef.close(data.returnPage);
    }, 2800);
  }
}
