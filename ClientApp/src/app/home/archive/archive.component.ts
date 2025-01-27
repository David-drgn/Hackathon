import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { canActiveGuard } from 'src/app/guards/canActive/can-active.guard';
import { DialogComponent } from 'src/app/popUp/dialog/dialog.component';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';

interface DocumentAnnotation {
  annotationid: string;
  documentbody: string;
  filename: string;
  mimetype: string;
  filesize: number;
  createdon: Date;
}

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css'],
})
export class ArchiveComponent {
  documentos: DocumentAnnotation[] = [];
  docSelect: DocumentAnnotation | null = null;

  pdfSrc: SafeResourceUrl | null = null;

  constructor(
    private http: HttpService,
    private storage: StorageService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private canActive: canActiveGuard
  ) {
    this.getArchives();
  }

  convertToMB(bytes: number): string {
    if (bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  deleteFiles(id: string) {
    this.storage.load.next(true);
    this.http
      .POST('deleteArchive', {
        id,
      })
      .subscribe((res) => {
        this.storage.load.next(false);
        if (res.erro) {
          this.openDialog(
            'O arquivo não foi deletado',
            'Perdão, porém, ocorreu um erro ao deletar o arquivo'
          );
        } else {
          this.getArchives();
          this.pdfSrc = '';
        }
      });
  }

  fileChangeCreate(event: any) {
    const file = event.target.files[0];
    if (file && file.type.includes('pdf')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.storage.load.next(true);
        const result = e.target?.result;
        if (typeof result === 'string') {
          const base64String = result.split(',')[1];

          this.http
            .POST('createArchive', {
              record: {
                documentbody: base64String,
                mimetype: 'application/pdf',
                filename: file.name,
                ['objectid_account@odata.bind']: `/accounts(${
                  this.storage.user.getValue().accountid
                })`,
              },
            })
            .subscribe(
              (res) => {
                this.storage.load.next(false);
                if (res.erro) {
                  this.openDialog(
                    'Erro ao salvar arquivo',
                    'Perdão, porém seu arquivo não foi salvo, por favor, tente novamente'
                  );
                }
                this.getArchives();
              },
              (Erro) => {
                console.log(Erro);
                this.openDialog(
                  'Erro ao salvar arquivo',
                  'Perdão, porém seu arquivo não foi salvo, por favor, tente novamente'
                );
                this.storage.load.next(false);
              }
            );
        }
      };
      reader.readAsDataURL(file);
    } else {
      this.openDialog(
        'Erro ao carregar PDF',
        'Verifique se o arquivo selecionado realmente é um PDF'
      );
    }
  }

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: { message, title },
    });
  }

  getArchives() {
    this.http
      .POST('getArchive', {
        id: this.storage.user.getValue().accountid,
      })
      .subscribe((res) => {
        if (res.erro) {
          console.error('Erro na busca');
          this.canActive.canActivate();
        } else {
          this.documentos = res.response.results;
          console.log(this.documentos);
        }
      });
  }

  viewAchive(item: any) {
    this.docSelect = item;
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      `data:application/pdf;base64,${this.docSelect?.documentbody}`
    );
  }
}
