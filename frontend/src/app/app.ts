import { Component, LOCALE_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es'; //para que fucncione la DatePipe con el formato de fecha. 

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  //     {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: AuthInterceptor,
  //   multi: true
  // }
  ]
})
export class App {
  protected readonly title = signal('frontend');
}
