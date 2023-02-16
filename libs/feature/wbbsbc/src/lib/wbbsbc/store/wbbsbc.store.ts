import { Injectable } from '@angular/core';
import { Store } from '@jam/shared/store';
import { wbbsbcState } from './wbbsbc.state';

@Injectable({
  providedIn: 'root'
})
export class WbbsbcStore extends Store<wbbsbcState> {

  constructor() {
    super({
      title: 'Walker Bay Boat & Ski-boat Club'
    });
   }
}
