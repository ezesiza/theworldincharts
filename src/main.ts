import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppModule } from 'app/app.module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// bootstrapApplication(AppModule)
//   .catch((err) => console.error(err));

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  // eslint-disable-next-line no-console -- because this is the required console
  .catch((err) => console.error(err));