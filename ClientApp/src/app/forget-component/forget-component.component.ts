import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forget-component',
  templateUrl: './forget-component.component.html',
  styleUrls: ['./forget-component.component.css'],
})
export class ForgetComponentComponent {
  constructor(private route: ActivatedRoute) {}

  viewPassword: boolean = true;
  userId: string | null = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      console.log(this.userId);
    });
  }
}
