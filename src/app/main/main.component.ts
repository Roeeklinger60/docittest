import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  title = 'docit2';
  vis = true;

  vis_off() {
    this.vis = false
  }

  constructor() { }

  ngOnInit() {
  }

}
