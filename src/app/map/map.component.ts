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
      this.eventService.getEvents().then(events => {
         for(var i = 0; i < events.length; i++) {
            if(events[i].length > 0) {
               for(var j = 0; j < events[i].length; j++) {
                  var eventDate = (new Date(events[i][j].start_time));
                  eventDate.setHours(0, 0, 0, 0);
                  var today = (new Date());
                  today.setHours(0, 0, 0, 0);

                  if(today.getTime() > eventDate.getTime()) {
                     break;
                  } else {
                     if(today.getTime() == eventDate.getTime()) {
                        this.markers.push({
                           lat: events[i][j].place.location.latitude,
                           lng: events[i][j].place.location.longitude
                        });
                     }

                     // Want to map events to their date and save as a cookie
                  }
               }
            }
         }
      }).catch(e => console.error(e));
   }
}

interface Marker {
   lat: number;
   lng: number;
}
