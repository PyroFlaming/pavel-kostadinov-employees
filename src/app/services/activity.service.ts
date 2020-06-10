import { Injectable } from '@angular/core';
import { EmployeeActivity } from '../../interfaces/employee-activity.interface';
import { BehaviorSubject } from 'rxjs';
import { WTogetherEmployers } from '../../interfaces/w-together-employers.interface';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  public employersActivity: BehaviorSubject<Array<EmployeeActivity>>
    = new BehaviorSubject([]);

  constructor() { }

  public addMultipleActivities(arrActivities: EmployeeActivity[]) {
    this.employersActivity.next([
      ...arrActivities,
      ...this.employersActivity.getValue()
    ]);
  }

  extractActivitiesFromString(activitiesString: string): EmployeeActivity[] {
    const activitiesArr: EmployeeActivity[] = activitiesString.split('\n').map(row => {
      const activityData = row.split(', ');

      return {
        projectId: activityData[1],
        empId: activityData[0],
        startActivity: new Date(activityData[2]),
        endActivity: activityData[3] === 'NULL' ? null : new Date(activityData[3])
      };
    });

    return activitiesArr;
  }

  getTwoEmpWTogetherMostTime(activities: EmployeeActivity[]): { empA: string, empB: string, sumOfTime: number } | null {
    const workedTogetherOnProject = this.findEmployersWTogetherOnProject(activities);

    if (!workedTogetherOnProject.length) {
      return null;
    }

    let awtCopy = workedTogetherOnProject.slice();

    const allCp = [];
    for (let index = 0; index < workedTogetherOnProject.length; index++) {
      const couple = workedTogetherOnProject[index];

      const coupleWorkTogetherOnProjects =
        awtCopy.filter((cp) => {
          return couple.empA === cp.empA && couple.empB === cp.empB;
        });

      if (coupleWorkTogetherOnProjects.length) {

        allCp.push(coupleWorkTogetherOnProjects);

        awtCopy = awtCopy.filter(el => coupleWorkTogetherOnProjects.indexOf(el) === -1);
      }
    }

    let mostWTogether: { empA: string, empB: string, sumOfTime: number } | null = null;

    for (let index = 0; index < allCp.length; index++) {
      const el: WTogetherEmployers[] = allCp[index];

      const sumTime = el.reduce((sum, element) => {
        return sum + element.wTimeTogether;
      }, 0);

      if (!mostWTogether || mostWTogether && mostWTogether.sumOfTime < sumTime) {
        mostWTogether = {
          empA: el[0].empA, empB: el[0].empB, sumOfTime: sumTime
        };
      }
    }

    return mostWTogether;
  }

  public findEmployersWTogetherOnProject(activities: EmployeeActivity[]): WTogetherEmployers[] {
    const couples = [];

    for (let index = 0; index < activities.length; index++) {
      const currentActivity = activities[index];

      for (let j = index + 1; j < activities.length; j++) {
        const activity = activities[j];

        if (
          currentActivity.projectId === activity.projectId && currentActivity.empId !== activity.empId
        ) {
          const workedTimeTogether = this.calculateActivitiesMatchedTime(currentActivity, activity);

          if (workedTimeTogether) {
            const exCouple =
              couples.find(
                couple => couple.projectId === currentActivity.projectId &&
                  (couple.empA === currentActivity.empId && couple.empB === activity.empId ||
                    couple.empB === currentActivity.empId && couple.empA === activity.empId)
              );

            if (exCouple) {
              exCouple.wTimeTogether = workedTimeTogether;
            } else {
              couples.push({
                empA: currentActivity.empId,
                empB: activity.empId,
                projectId: currentActivity.projectId,
                wTimeTogether: workedTimeTogether
              });
            }

          }
        }
      }
    }

    return couples;
  }

  private calculateActivitiesMatchedTime(activityA: EmployeeActivity, activityB: EmployeeActivity) {
    const currentTime = Math.round(new Date().getTime() / 1000);

    const startWTogetherDate =
      activityA.startActivity - activityB.startActivity <= 0 ?
        activityB.startActivity : activityA.startActivity;

    const activityAEndDate = activityA.endActivity ? activityA.endActivity : new Date();
    const activityBEndDate = activityA.endActivity ? activityA.endActivity : new Date();

    const endWTogetherDate =
      activityAEndDate - activityBEndDate >= 0 ? activityBEndDate : activityAEndDate;

    return endWTogetherDate > startWTogetherDate ? endWTogetherDate - startWTogetherDate : 0;
  }

}
