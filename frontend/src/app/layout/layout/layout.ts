import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar/navbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [
    RouterModule,
    Navbar,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
