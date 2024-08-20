import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DialogComponent } from 'src/app/popUp/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Calendar, CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventComponent } from 'src/app/popUp/event/event.component';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
})
export class CalendarioComponent {
  events: [] = [];

  @ViewChildren('calendar') calendar!: QueryList<ElementRef>;

  viewCalendar: number = 1;
  calendarView: string = 'dayGridMonth';
  calendarObj!: Calendar;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: this.calendarView,
    weekends: true,
    events: [],
    customButtons: {
      view: {
        text: 'Trocar visualização',
        click: () => {
          this.changeCalendarView();
        },
      },
      today: {
        text: 'Hoje',
        click: () => {
          this.calendarObj.today();
        },
      },
      prox: {
        text: 'Próximo',
        icon: 'chevron-right',
        click: () => {
          this.calendarObj.next();
        },
      },
      ant: {
        text: 'Anterior',
        icon: 'chevron-left',
        click: () => {
          this.calendarObj.prev();
        },
      },
    },
    locale: 'pt-br',
    selectable: true,
    headerToolbar: {
      left: 'ant today prox',
      center: 'title',
      right: 'view',
    },
    dateClick: (info) => {
      if (info.date.getTime() > new Date().getTime()) {
        let event = this.dialog.open(EventComponent, {
          data: {
            info,
            type: this.storage.user.getValue().new_tipodaconta,
          },
        });

        event.afterClosed().subscribe((result) => {});

        // alert("selected " + info.startStr + " to " + info.endStr)
        // $("#event").empty();
        // $(document).ready(function () {
        //   debugger;
        //   $("#event").load("/pages/PopUp/event/event.html", async function () {
        //     document.getElementById("user").style.display = "none";
        //     document.getElementById("enterprise").style.display = "none";
        //     if (user.new_tipodaconta == 0) {
        //       document.getElementById("user").style.display = "flex";
        //     } else {
        //       document.getElementById("enterprise").style.display = "flex";
        //     }

        //     if (info.dateStr.includes("T")) {
        //       document.getElementById(
        //         "dateSelect"
        //       ).textContent = `${formatarData(info.dateStr.split("T")[0])}`;
        //       document.getElementById("timePrestador").value = `${
        //         info.dateStr.split("T")[1].split(":")[0]
        //       }:${info.dateStr.split("T")[1].split(":")[1]}`;

        //       document.getElementById(
        //         "dateSelectMedico"
        //       ).textContent = `${formatarData(info.dateStr.split("T")[0])}`;
        //       document.getElementById("timePrestadorFinal").value = `${
        //         info.dateStr.split("T")[1].split(":")[0]
        //       }:30`;

        //       next();
        //     } else {
        //       document.getElementById(
        //         "dateSelect"
        //       ).textContent = `${formatarData(info.dateStr)}`;

        //       document.getElementById(
        //         "dateSelectMedico"
        //       ).textContent = `${formatarData(info.dateStr)}`;
        //     }

        //     let services = await getAllServices();

        //     let selectElement = document.getElementById("selectOptions");

        //     services.forEach((element) => {
        //       let option = document.createElement("option");

        //       option.value = element.new_servicoid;
        //       option.title = element.new_descricao;
        //       option.text = element.new_name;

        //       selectElement.add(option);
        //     });
        //   });
        // });
      }
    },
  };

  constructor(
    private http: HttpService,
    private storage: StorageService,
    private dialog: MatDialog
  ) {}

  openDialog(title: string, message: string, returnPage: any = null) {
    return this.dialog.open(DialogComponent, {
      data: {
        title,
        message,
        returnPage,
      },
    });
  }

  ngAfterViewInit() {
    if (this.calendar) {
      this.calendar.forEach((element) => {
        this.calendarObj = new Calendar(
          element.nativeElement,
          this.calendarOptions
        );
      });
      this.calendarObj.render();
      this.storage.events.subscribe((value) => {
        if (this.calendarObj.getEvents())
          this.calendarObj.getEvents().forEach((element) => {
            element.remove();
          });

        if (value)
          value.forEach((element: any) => {
            this.calendarObj.addEvent(element);
          });
      });
    }
  }

  private changeCalendarView() {
    switch (this.viewCalendar) {
      case 0:
        this.calendarView = 'dayGridMonth';
        break;
      case 1:
        this.calendarView = 'timeGridWeek';
        break;
      case 2:
        this.calendarView = 'listWeek';
        break;
      case 3:
        this.calendarView = 'dayGridWeek';
        break;
      case 4:
        this.calendarView = 'timeGridDay';
        this.viewCalendar = -1;
        break;
    }
    this.viewCalendar++;
    this.calendarObj.changeView(this.calendarView);
  }
}
