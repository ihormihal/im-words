import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HomeComponent } from './home/home.component'
import { CategoryComponent } from './category/category.component'
import { WordComponent } from './word/word.component'


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'category/:category_id', component: CategoryComponent },
  { path: 'category/:category_id/learn', component: WordComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
