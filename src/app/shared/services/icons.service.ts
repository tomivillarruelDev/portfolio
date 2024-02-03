import { Injectable } from '@angular/core';
import { IconInterface } from '../interfaces/icons.interface';

@Injectable({providedIn: 'root'})
export class IconsService {

  socials: IconInterface = {
    'LinkedIn': {

      url: 'https://www.linkedin.com/in/tomasvillarruel/',
      color: '#0A66C2' ,
      icon: './assets/icons/linkedIn.svg'
    },
    'GitHub': {
      url: 'https://github.com/tomivillarruelDev',
      color: '#D2D4D7',
      icon: './assets/icons/github.svg'
    },
    'Discord': {
      url: 'https://discordapp.com/users/1184195164021981210',
      color: '#5865F2',
      icon: './assets/icons/discord.svg'
    },
  }

  constructor() { }

}
