import { Component, OnInit } from '@angular/core';

import { GeolocationService } from '../geolocation.service';
import { EventService } from '../event.service';
import { STYLES } from './map-styles';

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
   markers: Marker[] = [];

   constructor(private geolocationService: GeolocationService, private eventService: EventService) { }

   ngOnInit() {
      this.getLocation();
   }

   getLocation() {
      this.geolocationService.getLocation().then((response) => {
         this.lat = response.coords.latitude;
         this.lng = response.coords.longitude;
         this.getEvents();
      }, function(error) {
         console.error("Failed to locate user.", error);
      });
   }

   getEvents() {
      this.eventService.getLikedPages().then(pages => {
         for(var i = 0; i < pages.length; i++) {
            this.eventService.getEventsForLikedPage(pages[i]).then(events => {
               for(var j = 0; j < events.length; j++) {
                  var eventDate = (new Date(events[j].start_time));
                  eventDate.setHours(0, 0, 0, 0);
                  var today = (new Date());
                  today.setHours(0, 0, 0, 0);

                  if(today.getTime() > eventDate.getTime()) {
                     break;
                  } else {
                     if(today.getTime() == eventDate.getTime()) {
                        // Want to animate markers so they drop from ceiling
                        // Consider threading when pushing events onto the array
                        this.markers.push({
                           lat: events[j].place.location.latitude,
                           lng: events[j].place.location.longitude,
                        });
                     }

                     // Want to map events to their date and save as a cookie
                  }
               }
            })
         }
      })
   }
}

// Want to add marker animation to have it drop from the top of the screen, but
interface Marker {
   lat: number;
   lng: number;
}
