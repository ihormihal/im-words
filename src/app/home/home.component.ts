import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, Params } from '@angular/router'
import { Category, CategoriesService} from './../services/categories.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private categoriesService: CategoriesService, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  categories:Category[] = []
  loading:boolean = false

  ngOnInit() {
    this.loading = true
    this.categoriesService.fetchCategories()
      .subscribe(categories => {
        this.categories = categories
        this.loading = false
      })
  }

}
