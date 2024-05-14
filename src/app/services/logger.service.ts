import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';
import { HEADERS } from './app.headers';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private http: HttpClient) { }

  debug(msg : string) {
    console.debug(msg);
  }

  info(msg : string) {
    console.info(msg);
  }

  warn(msg : string) {
    console.warn(msg);
  } 

  handleError(error: any): void {
    console.error(error);

    try {
      //TODO figure out where and why this is happening. Note in prod only
      if (error.message.indexOf("The operation attempted to access data outside the valid range") > -1)
        return;
    }
    catch { }

    const body = this.formatException(error);
    const options = { headers: HEADERS };
    let uri = environment.apiEndpoint + '/Logger/LogError';

    this.http.post(uri, body, options)
      .subscribe();
  }

  private formatException(error: any): string {
    try {
      if (error.status == 401) {
        return JSON.stringify({ "Message": error.text(), "Detail": "Endpoint: " + error.url });
      }

      if (error.status == 500) {
        return JSON.stringify({ "Message": error.message, "Detail": error.innerException.message + "\nEndpoint: " + error.url });
      }

      return JSON.stringify({ "Message": error.message, "Detail": error.stack });
    }
    catch (err) {
      return JSON.stringify({ "Message": error.message, "Detail": error.stack });
    }
  }

}
