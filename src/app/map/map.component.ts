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
    this.eventService.getEvents();
    /*this.eventService.getShows(this.lat, this.lng, distance, since, until)
      .then((response) => {
        console.log(response);
      }, function(error) {
        console.error("Failed to get shows.", error);
      })*/
  }

  getUnixDate(y = 0, midnight = false) {
    var x = new Date()
    x.setMilliseconds(0);

    if(midnight) {
      x.setHours(23);
      x.setMinutes(59);
      x.setSeconds(59);
    }

    return +x / 1000;
  }
}
