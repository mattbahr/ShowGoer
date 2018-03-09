import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { FacebookService, InitParams, LoginResponse } from 'ngx-facebook'

import { Event } from './event';

@Injectable()
export class EventService {

   private userId: number;
   private scope: string = 'user_likes';

   // Want to implement a method to RSVP for an event; just make a POST request
   // to {event_id}/attending or {event_id}/interested

   constructor(private fb: FacebookService, private http: Http) {
      let initParams: InitParams = {
         appId: '410586846011126',
         xfbml: true,
         version: 'v2.12'
      };

      fb.init(initParams);
   }

   getUserId(): Promise<number> {
      return new Promise((resolve, reject) => {
         if(this.userId) {
            resolve(this.userId);
         } else {
            this.fbApiRequest('me').then(me => {
               this.userId = me.id;
               resolve(this.userId);
            })
         }
      })
   }

   fbLogin(): Promise<LoginResponse> {
      return new Promise((resolve, reject) => {
         this.fb.login({scope: this.scope}).then((response: LoginResponse) => {
            resolve(response);
         }).catch(e => reject(e));
      })
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
         this.fbPagedRequest('me/likes?fields=id').then(likes => {
            resolve(likes);
         }).catch(e => reject(e));
      });
   }

   getEventAttendees(event): Promise<any> {
      return new Promise((resolve, reject) => {
         this.fbPagedRequest(event.id + '/attending').then(attendees => {
            resolve(attendees);
         }).catch(e => reject(e));
      })
   }

   getEventInterested(event): Promise<any> {
      return new Promise((resolve, reject) => {
         this.fbPagedRequest(event.id + '/interested').then(interested => {
            resolve(interested);
         }).catch(e => reject(e));
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
