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
         this.fbPagedRequest('me/likes?fields=name,id,category').then(likes => {
            for(var i = 0; i < likes.length; i++) {
               this.fbPagedRequest(likes[i].id + '/events').then(events => {
                  console.log(events);
               });
            }
         });
      })
   }

   private fbPagedRequest(requestUrl): Promise<any> {
      return new Promise((resolve, reject) => {
         var pages = [];

         this.fbApiRequest(requestUrl).then(res => {
            if(res.data) {
               pages = pages.concat(res.data);
            }

            if(res.paging && res.paging.next) {
               this.fbPagedRequest(res.paging.next).then(result => {
                  pages = pages.concat(result);
                  resolve(pages);
               });
            } else {
               resolve(pages);
            }
         });
      });
   }

   private fbApiRequest(requestUrl): Promise<any> {
      return new Promise((resolve, reject) => {
         this.fb.api(requestUrl).then(res => {
            resolve(res);
         }).catch(e => reject(e));
      });
   }
}
