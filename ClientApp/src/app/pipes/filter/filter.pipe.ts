import { Pipe, PipeTransform } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  constructor(private storage: StorageService) {}

  transform(items: any[], type: number): any[] {
    let searchText = this.storage.search.getValue().toLowerCase();

    if (!items) return [];
    if (!searchText) return items;

    console.log(searchText);

    return items.filter((it) => {
      switch (type) {
        case 1:
          const formattedStart = new Date(it.start)
            .toLocaleString('pt-BR', {
              timeZone: 'UTC',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            .toLowerCase();

          const formattedEnd = new Date(it.end)
            .toLocaleString('pt-BR', {
              timeZone: 'UTC',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            .toLowerCase();

          if (
            it.title.toLowerCase().includes(searchText) ||
            it.service.toLowerCase().includes(searchText) ||
            it.local.toLowerCase().includes(searchText) ||
            formattedStart.includes(searchText) ||
            formattedEnd.includes(searchText)
          )
            return true;
          else return false;
          break;
        case 2:
          return it.name.toLowerCase().includes(searchText);
      }
    });
  }
}
