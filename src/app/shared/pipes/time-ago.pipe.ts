import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'timeAgo',
  standalone: true
})

export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'Hace un momento';
    }

    const intervals: { [key: string]: number } = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        if (interval === 1) {
          return `Hace un ${name}`;
        }
        return `Hace ${interval} ${name}${name === 'mes' ? 'es' : 's'}`;
      }
    }

    return 'Hace un momento';
  }
}
