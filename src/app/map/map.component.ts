import { Component, OnInit } from '@angular/core';

import { GeolocationService } from '../geolocation.service';
import { EventService } from '../event.service';
import { STYLES } from './map-styles';
import { Event } from '../event';
import { Place } from '../place';

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
   places: Place[] = [];
   eventMap = new Map();
   placeMap = new Map();
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

   // Also want to pull events for which the user has RSVP'd or is a host,
   // regardless of what pages they're tied to
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

                        // Create a marker for events happening on the desired
                        // date
                        dt = new Date(parseInt(this.displayDate.substring(0, 4)),
                           parseInt(this.displayDate.substring(5, 7)) - 1,
                           parseInt(this.displayDate.substring(8)));

                        if(!this.places.includes(events[j].place)) {
                           if(dt.getTime() == eventDate.getTime()) {
                              this.places.push(events[j].place);

                              if(this.placeMap.has(events[j].place)) {
                                 var tempEvents = this.placeMap.get(events[j].place);
                              } else {
                                 tempEvents = [];
                              }

                              tempEvents.push(events[j]);
                              this.placeMap.set(events[j].place, tempEvents);
                           } else if(events[j].end_time && dt.getTime() > eventDate.getTime()) {
                              dt.setHours(6, 0, 0, 0);

                              if(dt.getTime() <= eventEndTime.getTime()) {
                                 this.places.push(events[j].place);

                                 if(this.placeMap.has(events[j].place)) {
                                    var tempEvents = this.placeMap.get(events[j].place);
                                 } else {
                                    tempEvents = [];
                                 }

                                 tempEvents.push(events[j]);
                                 this.placeMap.set(events[j].place, tempEvents);
                              }
                           }
                        }

                        // Need to account for events that happen over a range
                        // of dates but don't happen continuously over the range

                        if(!events[j].end_time) {
                           eventEndTime = new Date(eventDate);
                           eventEndTime.setDate(eventEndTime.getDate() + 1);
                        }

                        // Maps events to their locations and dates
                        while(eventDate.getTime() < eventEndTime.getTime()) {
                           var eventEndDate = new Date(eventEndTime);
                           eventEndDate.setHours(0, 0, 0, 0);

                           if(eventDate.getTime() == eventEndDate.getTime()) {
                              eventEndDate.setHours(6, 0, 0, 0);

                              if(eventEndDate.getTime() >= eventEndTime.getTime()) {
                                 break;
                              }
                           }

                           if(this.eventMap.has(eventDate.getTime())) {
                              var tempMap = this.eventMap.get(eventDate.getTime());

                              if(tempMap.has(events[j].place)) {
                                 var ary = tempMap.get(events[j].place);
                                 ary.push(events[j]);
                              } else {
                                 ary = [events[j]];
                              }

                              tempMap.set(events[j].place, ary);
                           } else {
                              tempMap = new Map();
                              ary = events[j];
                           }

                           tempMap.set(events[j].place, ary);
                           this.eventMap.set(eventDate.getTime(), tempMap);
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
         this.placeMap = this.eventMap.get(inputDate.getTime());

         if(this.placeMap.keys()) {
            this.places = <Place[]>Array.from(this.placeMap.keys());
         } else {
            this.places = [];
         }

         // Do a check to make sure events have not ended already when the
         // current date is selected
         if(inputDate.getTime() == today.getTime() && this.places) {
            today = new Date();

            for(var i = 0; i < this.places.length; i++) {
               var events = this.placeMap.get(this.places[i]);

               for(var j = 0; j < events.length; j++) {
                  if(events[j].end_time) {
                     var endDate = new Date(events[j].end_time);

                     if(today.getTime() >= endDate.getTime()) {
                        events.splice(j, 1);
                        j--;
                     }
                  }
               }

               this.placeMap.set(this.places[i], events);
            }

            this.eventMap.set(inputDate.getTime(), this.placeMap);
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
