import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WbbsbcStore } from './store/wbbsbc.store';

@Component({
  selector: 'wbbsbc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wbbsbc.component.html',
  styleUrls: ['./wbbsbc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WbbsbcComponent {
  constructor(public store: WbbsbcStore) {
    
  }
}
