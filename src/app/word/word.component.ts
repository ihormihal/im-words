import { Component, OnInit } from '@angular/core'
import { Word, WordsService} from './../services/words.service'

@Component({
  selector: 'app-word',
  templateUrl: './word.component.html',
  styleUrls: ['./word.component.scss']
})
export class WordComponent implements OnInit {
  
  constructor(private wordsService: WordsService) { }

  loading = false
  words: Word[] = []
  

  ngOnInit() {
    this.fetchWords()
  }

  fetchWords() {
    this.loading = true
    this.wordsService.fetchWords(1)
      .subscribe(words => {
        this.words = words
        this.loading = false
      })
  }

}
