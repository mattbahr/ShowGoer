import { Component, OnInit } from '@angular/core';

import { GeolocationService } from '../geolocation.service';
import { EventService } from '../event.service';
import { STYLES } from './map-styles';
import { Event } from '../event';

/* Test code */
import { EVENTS } from '../test/mock-events';

@Component({
   selector: 'app-map',
   templateUrl: './map.component.html',
   styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

   lat: number = 30.2672;
   lng: number = -97.7431;
   zoom: number = 12;
   styles = STYLES;
   events: Event[] = [];
   eventMap = new Map();
   displayDate: string;

   constructor(private geolocationService: GeolocationService, private eventService: EventService) { }

   ngOnInit() {
      this.displayDate = this.getDatePickerString(new Date());
      this.getLocation();
      this.getEvents();
   }

   getLocation() {
      this.geolocationService.getLocation().then((response) => {
         this.lat = response.coords.latitude;
         this.lng = response.coords.longitude;
      }, function(error) {
         console.error("Failed to locate user.", error);
      });
   }

   getEvents() {

      /* Test code */
      //this.events = EVENTS;

      /* Production code */
      this.eventService.fbLogin().then(response => {
         this.eventService.getLikedPages().then(pages => {
            for(var i = 0; i < pages.length; i++) {
               this.eventService.getEventsForLikedPage(pages[i]).then(events => {
                  for(var j = 0; j < events.length; j++) {
                     var eventDate = new Date(events[j].start_time);
                     eventDate.setHours(0, 0, 0, 0);
                     var dt = new Date();

                     // Exclude events that have already ended
                     if(events[j].end_time) {
                        var eventEndTime = new Date(events[j].end_time);

                        if(dt.getTime() >= eventEndTime.getTime()) {
                           continue;
                        }
                     }

                     dt.setHours(0, 0, 0, 0);

                     if(dt.getTime() > eventDate.getTime() && !events[j].end_time) {
                        continue;
                     } else if(events[j].place
                        && events[j].place.location
                        && events[j].place.location.latitude
                        && events[j].place.location.longitude) {

                        // Need to figure out what happens when multiple events
                        // happen at the same location on the same date

                        // Create a marker for events happening on the desired
                        // date
                        dt = new Date(parseInt(this.displayDate.substring(0, 4)),
                           parseInt(this.displayDate.substring(5, 7)) - 1,
                           parseInt(this.displayDate.substring(8)));

                        if(dt.getTime() == eventDate.getTime()
                           || (events[j].end_time
                              && dt.getTime() >= eventDate.getTime()
                              && dt.getTime() <= eventEndTime.getTime())) {
                           this.events.push(events[j]);
                        }

                        // Maps events to their dates
                        if(!events[j].end_time) {
                           eventEndTime = new Date(eventDate);
                           eventEndTime.setDate(eventEndTime.getDate() + 1);
                        }

                        while(eventDate.getTime() < eventEndTime.getTime()) {
                           if(this.eventMap.has(eventDate.getTime())) {
                              var ary = this.eventMap.get(eventDate.getTime());
                              ary.push(events[j]);
                              this.eventMap.set(eventDate.getTime(), ary);
                           } else {
                              this.eventMap.set(eventDate.getTime(), [events[j]]);
                           }

                           eventDate.setDate(eventDate.getDate() + 1);
                        }
                     }
                  }
               });
            }
         }).catch(e => console.error(e));
      }).catch(e => console.error(e));
   }

   onDisplayDateChange() {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var inputDate = new Date(parseInt(this.displayDate.substring(0, 4)),
         parseInt(this.displayDate.substring(5, 7)) - 1,
         parseInt(this.displayDate.substring(8)));

      if(inputDate.getTime() < today.getTime()) {
         this.displayDate = this.getDatePickerString();
         (<HTMLInputElement>document.getElementById('dateInput')).value = this.displayDate;
      } else {
         this.events = this.eventMap.get(inputDate.getTime());

         // Do a check to make sure events have not ended already when the
         // current date is selected
         if(inputDate.getTime() == today.getTime()) {
            today = new Date();

            for(var i = 0; i < this.events.length; i++) {
               if(this.events[i].end_time) {
                  var endDate = new Date(this.events[i].end_time);

                  if(today.getTime() >= endDate.getTime()) {
                     this.events.splice(i, 1);
                     this.eventMap.set(inputDate.getTime(), this.events);
                  }
               }
            }
         }
      }
   }

   getDatePickerString(dt = null) {
      if(!dt) {
         dt = new Date();
      }

      return dt.getFullYear() + "-" +
         ("0" + (dt.getMonth() + 1)).slice(-2) + "-" +
         ("0" + dt.getDate()).slice(-2);
   }
}
