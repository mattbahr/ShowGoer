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

  getEvents() {
    this.fb.login({scope: 'user_likes'}).then((response: LoginResponse) => {
      console.log(response);
      this.fbApiRequest('me/likes?fields=name,id,category,events');
    });
  }

  private fbApiRequest(requestUrl) {
    this.fb.api(requestUrl)
      .then(res => {
        console.log(res);

        if(res.paging && res.paging.next) {
          this.fbApiRequest(res.paging.next);
        }
      }).catch(e => console.error(e));
  }
}
