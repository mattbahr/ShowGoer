import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { FacebookService, InitParams, LoginResponse } from 'ngx-facebook'

@Injectable()
export class EventService {

  startTime: Date;
  endTime: Date;

  constructor(private fb: FacebookService, private http: Http) {
    let initParams: InitParams = {
      appId: '410586846011126',
      xfbml: true,
      version: 'v2.8'
    };

    fb.init(initParams);
  }

  // For some reason this only returns 79 events when I test. Need to figure out why
  getEvents() {
    this.fb.login().then((response: LoginResponse) => {
      console.log(response);
      this.getEventsRequest('search?q=*&type=event&categories=["ARTS_ENTERTAINMENT"]');
    });
  }

  private getEventsRequest(requestUrl) {
    this.fb.api(requestUrl)
      .then(res => {
        console.log(res);
        
        if(res.paging && res.paging.next) {
          this.getEventsRequest(res.paging.next);
        }
      }).catch(e => console.error(e));
  }
}
