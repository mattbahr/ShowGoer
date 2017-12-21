import { Component, OnInit } from '@angular/core';

import { GeolocationService } from '../geolocation.service';

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

  constructor(private geolocationService: GeolocationService) { }

  ngOnInit() {
    this.getLocation();
  }

  getLocation() {
    this.geolocationService.getLocation().then((response) => {
      this.lat = response.coords.latitude;
      this.lng = response.coords.longitude;
    }, function(error) {
      console.error("Failed to locate user.", error);
    });
  }

}
