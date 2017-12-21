import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { GeolocationService } from './geolocation.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD6k-2yBM1dT5MiwWE3hiQUBjDG8eVZ9Go'
    })
  ],
  providers: [GeolocationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
