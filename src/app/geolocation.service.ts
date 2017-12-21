import { Injectable } from '@angular/core';

@Injectable()
export class GeolocationService {

  constructor() { }

  // Funcion to return the location of the user's device
  getLocation(): Promise<Position> {
    return new Promise(function(resolve, reject) {
      if(window.navigator.geolocation) {
        var options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };

        var success = function(pos) {
          resolve(pos);
        }

        var error = function(err) {
          reject(Error(err))
        }

        navigator.geolocation.getCurrentPosition(success, error, options);
      }
    });
  }

}
