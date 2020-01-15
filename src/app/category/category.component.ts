import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, Params } from '@angular/router'
import { Word, CategoriesService} from './../services/categories.service'
import { SpeachService } from './../services/speach.service'

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})

export class CategoryComponent implements OnInit {

  constructor(
    private wordsService: CategoriesService,
    private speachService: SpeachService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  category_id:number = null
  loading:boolean = false
  words: Word[] = []
  

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.category_id = params.category_id
      this.fetchWords(params.category_id)
    })
  }

  fetchWords(category_id: number) {
    this.loading = true
    this.wordsService.fetchCategory(category_id)
      .subscribe(category => {
        this.words = category.words
        this.loading = false
      })
  }

  speakWord(word: string) {
    this.speachService.speak(word)
  }

  startLearn() {
    this.router.navigate([`/category`, this.category_id, 'learn'])
  }

}
