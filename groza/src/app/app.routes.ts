import { Routes } from '@angular/router';
import { ListComponent } from './core/list/list.component';
import { AboutComponent } from './shared/about/about.component';
import { AIHelperComponent } from './ai-helper/ai-helper.component';
export const routes: Routes = [
  { 
    path: '', 
    component: ListComponent,
    pathMatch: 'full'
  },
  { 
    path: 'about', 
    component: AboutComponent
  },
];