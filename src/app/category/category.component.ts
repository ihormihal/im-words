import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { Word, WordsService} from './../services/words.service'
import { SpeachService } from './../services/speach.service'

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})

export class CategoryComponent implements OnInit {

  constructor(
    private wordsService: WordsService, 
    private speachService: SpeachService,
    private route: ActivatedRoute
  ) { }

  loading = false
  words: Word[] = []
  displayedColumns: string[] = ['word', 'translations'];
  

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.fetchWords(params.category_id)
    })
  }

  fetchWords(category_id: number) {
    this.loading = true
    this.wordsService.fetchWords(category_id)
      .subscribe(words => {
        this.words = words
        this.loading = false
      })
  }

  speakWord(word: string) {
    this.speachService.speak(word)
  }

}
