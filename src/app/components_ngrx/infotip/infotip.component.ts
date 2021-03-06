import { Component, Input} from '@angular/core';

@Component({
  selector: 'infotip',
  templateUrl: './infotip.component.html',
  styleUrls: ['./infotip.component.less']
})

export class InfotipComponent {
  @Input() infotipText: string;

  handlePropagation(e) {
    if(e) {
      e.stopPropagation(); 
      e.preventDefault();
    }
  }
} 