import { RouterModule, Routes } from '@angular/router';
import { AlaaapDashboardComponent } from './home/components/dashboards/alaaap-dashboard/alaaap-dashboard.component';
import { NgModule } from '@angular/core';
import { LandingComponent } from './home/components/landing-component/landing.component';

export const routes: Routes = [
    {path:'', component: LandingComponent, pathMatch: 'full'},
    {path:'analytics', component: AlaaapDashboardComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })
  export class AppRoutingModule {}
