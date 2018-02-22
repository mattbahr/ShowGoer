import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { GeolocationService } from './geolocation.service';

import { FacebookModule } from 'ngx-facebook';
import { EventService } from './event.service';
import { EventComponent } from './event/event.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    EventComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD6k-2yBM1dT5MiwWE3hiQUBjDG8eVZ9Go'
    }),
    FacebookModule.forRoot()
  ],
  providers: [GeolocationService, EventService],
  bootstrap: [AppComponent]
})
export class AppModule { }
