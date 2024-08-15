import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { Calendar, CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
})
export class CalendarioComponent {
  @ViewChildren('calendar') calendar!: QueryList<ElementRef>;

  viewCalendar: number = 1;
  calendarView: string = 'dayGridMonth';
  calendarObj!: Calendar;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: this.calendarView,
    weekends: true,
    events: [{ title: 'Meeting', start: new Date() }],
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
  };

  ngAfterViewInit() {
    if (this.calendar) {
      this.calendar.forEach((element) => {
        this.calendarObj = new Calendar(
          element.nativeElement,
          this.calendarOptions
        );
      });
      this.calendarObj.render();
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
