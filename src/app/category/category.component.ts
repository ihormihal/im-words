import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router'
import { DOCUMENT } from '@angular/common'
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
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) { }

  lang: string = 'en_US'
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
        this.document.documentElement.lang = category.lang || 'en-US';
        this.lang = category.lang || 'en_US';
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
