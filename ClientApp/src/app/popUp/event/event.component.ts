import { Component, Inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { HttpService } from "src/app/services/http/http.service";
import { StorageService } from "src/app/services/storage/storage.service";
import { DialogComponent } from "../dialog/dialog.component";

interface Service {
  new_Account_new_Servico_new_Servico: AccountsService[] | undefined;
  "new_Account_new_Servico_new_Servico@odata.nextLink": string;
  new_descricao: string | null;
  new_name: string;
  new_servicoid: string;
}

interface AgendaItem {
  livre: string;
  termino: string;
  tipo: number;
}

interface AccountsService {
  agenda: AgendaItem[];
  description: string | null;
  docs: any[];
  documento: string;
  domicilio: string | null;
  endereco: string | null;
  id: string;
  image: string;
  name: string;
  service: boolean;
}

@Component({
  selector: "app-event",
  templateUrl: "./event.component.html",
  styleUrls: ["./event.component.css"],
})
export class EventComponent {
  step: number = 1;
  services: Service[] = [];
  accountsService: AccountsService[] | undefined = [];
  prestadorSelected: AccountsService | undefined;

  selectedDate: string = "none";
  availableTimeSlots: { start: Date; end: Date }[] = [];

  // record: {
  //   new_data_agendada: new Date(datas.dataInicial).toISOString(),
  //   new_dataterminoagenda: new Date(datas.dataFinal).toISOString(),
  //   ["new_Cliente@odata.bind"]: `/accounts(${user.accountid})`,
  //   ["new_Prestador@odata.bind"]: `/accounts(${idPrestador})`,
  //   new_local: document.getElementById("local").value,
  //   new_tipohorario: 2,
  //   ["new_Servico@odata.bind"]: `/new_servicos(${
  //     document.getElementById("selectOptions").value
  //   })`,
  // },

  formUser = this.formBuilder.group({
    servico: ["", Validators.required],
    local: ["", Validators.required],
    prestador: ["", [Validators.required]],
    dataterminoagenda: ["", Validators.required],
    dataagendada: ["", Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: StorageService,
    private http: HttpService,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    this.storage.load.next(true);
    this.getService();
  }

  getService() {
    this.http.POST("service/get").subscribe(
      (res) => {
        if (res.erro) {
          console.error("Erro na busca");
          this.getService();
        } else {
          this.services = res.response;
          this.storage.load.next(false);
        }
      },
      (Error) => {
        console.error("Erro na busca");
        this.getService();
      }
    );
  }

  changeOptionService(value: string) {
    if (value == "none") this.step = 1;
    else {
      this.step = 2;
      this.storage.load.next(true);

      this.http
        .POST("service/getAccounts", {
          serviceId: value,
        })
        .subscribe((res: any) => {
          this.storage.load.next(false);
          if (res.erro) {
          }
          if (res.response.length == 0) {
            this.step = 1;
            this.openDialog(
              "Nenhum prestador encontrado",
              "Nenhum prestador foi encontrado com a opção selecionada, sinto muito"
            );
          }
          this.accountsService = res.response;

          this.prestadorSelected = this.accountsService
            ? this.accountsService[0]
            : undefined;

          console.log(this.prestadorSelected);
        });
    }
  }

  getFilteredAgenda(): AgendaItem[] {
    return (
      this.prestadorSelected?.agenda.filter((item) => item.tipo === 1) || []
    );
  }

  isDateInAgenda(date: Date): boolean {
    return this.getFilteredAgenda().some((e) =>
      this.isSameDay(new Date(e.livre), date)
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // Método para obter horários a serem ignorados
  getIgnoredTimeSlots(): { start: Date; end: Date }[] {
    return (
      this.prestadorSelected?.agenda
        .filter((item) => item.tipo === 2)
        .map((item) => ({
          start: new Date(item.livre),
          end: new Date(item.termino),
        })) || []
    );
  }

  generateTimeSlots(
    start: string,
    end: string,
    ignoredSlots: { start: Date; end: Date }[]
  ): { start: Date; end: Date }[] {
    let timeSlots: { start: Date; end: Date }[] = [];
    let current = new Date(start);
    let endTime = new Date(end);

    while (current < endTime) {
      let next = new Date(current);
      next.setMinutes(current.getMinutes() + 30);
      if (next > endTime) {
        next = endTime;
      }

      // Verificar se o slot atual está nos horários a serem ignorados
      const isIgnored = ignoredSlots.some(
        (slot) => current >= slot.start && current < slot.end
      );

      if (!isIgnored) {
        timeSlots.push({ start: new Date(current), end: new Date(next) });
      }

      current = next;
    }

    return timeSlots;
  }

  getAllTimeSlots(
    dateStart: string,
    dateEnd: string
  ): { start: Date; end: Date }[] {
    let allTimeSlots: { start: Date; end: Date }[] = [];
    let filterStartDate = new Date(dateStart);
    let filterEndDate = new Date(dateEnd);

    // Obter horários a serem ignorados
    const ignoredSlots = this.getIgnoredTimeSlots();

    this.getFilteredAgenda().forEach((item) => {
      const slots = this.generateTimeSlots(
        item.livre,
        item.termino,
        ignoredSlots
      );

      // Filtrando os slots com base no intervalo fornecido
      const filteredSlots = slots.filter((slot) => {
        return slot.start >= filterStartDate && slot.end <= filterEndDate;
      });

      allTimeSlots.push(...filteredSlots);
    });

    return allTimeSlots;
  }

  formatDateToUTC(dateString: string): string {
    const date = new Date(dateString);

    // Formatar a data em dd/MM/yy HH:mm
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Usar 24 horas
      timeZone: "UTC", // Garantir que a data está em UTC
    };

    const formatter = new Intl.DateTimeFormat("pt-BR", options);
    const formattedDate = formatter.format(date);
    return formattedDate;
  }

  formatHourToUTC(dateString: string): string {
    const date = new Date(dateString);

    // Formatar a data em dd/MM/yy HH:mm
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Usar 24 horas
      timeZone: "UTC", // Garantir que a data está em UTC
    };

    const formatter = new Intl.DateTimeFormat("pt-BR", options);
    const formattedDate = formatter.format(date);
    return formattedDate.split(", ")[1];
  }

  changeOptionPrestador(value: string) {
    console.log(value);
  }

  onDateChange() {
    if (this.selectedDate && this.selectedDate !== "none") {
      const [start, end] = this.selectedDate.split("|");
      this.availableTimeSlots = this.getAllTimeSlots(start, end);
    } else {
      this.availableTimeSlots = [];
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

  close() {
    this.dialogRef.close();
  }
}
