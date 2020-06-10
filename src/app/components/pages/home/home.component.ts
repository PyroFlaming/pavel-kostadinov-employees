import { ActivityService } from './../../../services/activity.service';
import { Component, OnInit } from '@angular/core';
import { EmployeeActivity } from '../../../../interfaces/employee-activity.interface';
import { WTogetherEmployers } from '../../../../interfaces/w-together-employers.interface';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public page = 1;
  public pageSize = 10;
  public collectionSize = 0;

  private _empWTogetherOnProjects: WTogetherEmployers[] = [];

  public twoEmpWTogetherMostTime: {
    empA: string;
    empB: string;
    sumOfTime: number;
  } = null;

  constructor(private _activityService: ActivityService) { }

  get empWTogetherOnProjects(): any[] {
    return this._empWTogetherOnProjects
      .map((wCouple: WTogetherEmployers) => {

        const transformWCouple = { ...wCouple };
        transformWCouple.wTimeTogether = Math.round(wCouple.wTimeTogether / 86400000);

        return transformWCouple;
      })
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }


  ngOnInit(): void {

  }

  public handlerReadData(text: string) {
    console.log(text);
    this.page = 1;
    this.collectionSize = 0;
    this.twoEmpWTogetherMostTime = null;
    this._empWTogetherOnProjects = [];

    const activities = this._activityService.extractActivitiesFromString(text);

    if (activities.length) {
      this._empWTogetherOnProjects = this._activityService.findEmployersWTogetherOnProject(activities);

      this.page = 1;
      this.collectionSize = this._empWTogetherOnProjects.length;

      this.twoEmpWTogetherMostTime = this._activityService.getTwoEmpWTogetherMostTime(activities);

      this._activityService.addMultipleActivities(activities);

    }
  }
}
