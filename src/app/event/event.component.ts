import { Component, OnInit, Input } from '@angular/core';

import { Event } from '../event';
import { EventService } from '../event.service';

enum DaysOfTheWeek {
   Sunday,
   Monday,
   Tuesday,
   Wednesday,
   Thursday,
   Friday,
   Saturday
}

enum Months {
   January,
   February,
   March,
   April,
   May,
   June,
   July,
   August,
   September,
   October,
   November,
   December
}

@Component({
   selector: 'app-event',
   templateUrl: './event.component.html',
   styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

   @Input() event: Event;

   going: boolean = false;
   interested: boolean = false;

   constructor(private eventService: EventService) { }

   ngOnInit() {
      //setAttendanceFlags();
   }

   setAttendanceFlags() {
      this.eventService.getEventAttendees(this.event).then(attendees => {
         this.checkForIdInList(attendees).then(isGoing => {
            this.going = isGoing;

            if(!this.going) {
               this.eventService.getEventInterested(this.event).then(interested => {
                  this.checkForIdInList(interested).then(isInterested => {
                     this.interested = isInterested;
                  }).catch(e => console.error(e));
               }).catch(e => console.error(e));
            }
         }).catch(e => console.error(e));
      }).catch(e => console.error(e));
   }

   checkForIdInList(list): Promise<boolean> {
      return new Promise((resolve, reject) => {
         this.eventService.getUserId().then(userId => {
            for(var i = 0; i < list.length; i++) {
               if(userId == list[i].id) {
                  resolve(true);
               }
            }

            resolve(false);
         }).catch(e => reject(e));
      });
   }

   getDateString(): string {
      if(!this.event.start_time) {
         return;
      }

      var today = new Date();
      today.setHours(0, 0, 0 ,0);
      var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var start = new Date(this.event.start_time);

      if(this.event.end_time) {
         var end = new Date(this.event.end_time);

         if(start.getTime() >= end.getTime()) {
            var hasEndTime = false;
         } else {
            hasEndTime = true;
         }
      }

      var startHour = start.getHours();
      var startMinute = start.getMinutes();
      start.setHours(0, 0, 0, 0);

      var dateString = this.formatDateInYear(start, today, ((hasEndTime && end.getFullYear() > start.getFullYear()) ? true : false)) + " at ";
      dateString += this.formatTimeInDate(startHour, startMinute);

      if(hasEndTime) {
         var endHour = end.getHours();
         var endMinute = end.getMinutes();
         end.setHours(0, 0, 0, 0);
         dateString += " to ";

         if(start.getTime() != end.getTime()) {
            dateString += this.formatDateInYear(end, today) + " at ";
         }

         dateString += this.formatTimeInDate(endHour, endMinute);
      }

      return dateString;
   }

   formatDateInYear(dt, today, displayYear = false): string {
      var weekAway = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
      var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      if(today.getTime() == dt.getTime()) {
         var str = "Today";
      } else if (tomorrow.getTime() == dt.getTime()) {
         str = "Tomorrow";
      } else {
         str = DaysOfTheWeek[dt.getDay()];

         if(dt.getTime() >= weekAway.getTime()) {
            str += ", " + Months[dt.getMonth()] + " " + dt.getDate();

            if(str.endsWith("1")) {
               str += "st";
            } else if(str.endsWith("2")) {
               str += "nd";
            } else if(str.endsWith("3")) {
               str += "rd";
            } else {
               str += "th";
            }

            if(dt.getFullYear() > today.getFullYear() || displayYear) {
               str += " " + dt.getFullYear();
            }
         }
      }

      return str;
   }

   formatTimeInDate(hours, minutes): string {
      if(hours >= 12) {
         hours -= 12;
         var period = "PM";
      } else {
         period = "AM";
      }

      if(hours == 0) {
         hours = 12;
      }

      var str = hours;

      if(minutes > 0) {
         str += ":" + ("0" + minutes).slice(-2);
      }

      str += " " + period;
      return str;
   }
}
