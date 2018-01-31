import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { FacebookService, InitParams, LoginResponse } from 'ngx-facebook'

import { Event } from './event';

@Injectable()
export class EventService {

   constructor(private fb: FacebookService, private http: Http) {
      let initParams: InitParams = {
         appId: '410586846011126',
         xfbml: true,
         version: 'v2.11'
      };

      fb.init(initParams);
   }

   getEventsForLikedPage(page): Promise<Event[]> {
      return new Promise((resolve, reject) => {
         this.fbPagedRequest(page.id + '/events').then(events => {
            resolve(events);
         }).catch(e => reject(e));
      });
   }

   getLikedPages(): Promise<any> {
      return new Promise((resolve, reject) => {
         this.fb.login({scope: 'user_likes'}).then((response: LoginResponse) => {
            this.fbPagedRequest('me/likes?fields=id').then(likes => {
               resolve(likes);
            }).catch(e => reject(e));
         }).catch(e => reject(e));
      });
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
         }).catch(e => reject(e));
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
