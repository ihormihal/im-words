import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, Params } from '@angular/router'
import { Word, CategoriesService} from './../services/categories.service'
import { SpeachService } from './../services/speach.service'

@Component({
  selector: 'app-word',
  templateUrl: './word.component.html',
  styleUrls: ['./word.component.scss']
})
export class WordComponent implements OnInit {
  
  constructor(
    private categoriesService: CategoriesService, 
    private speachService: SpeachService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  category_id:number = null
  loading:boolean = false
  words: Word[] = []
  progress:number = 0
  currentIndex:number = -1
  currentWord:Word
  currentValue:string = ''
  correctWord:string = ''

  isIncorrect:boolean = true
  isFinal:boolean = false

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.category_id = params.category_id
      this.fetchWords(params.category_id)
    })
  }

  fetchWords(category_id: number) {
    this.loading = true
    this.categoriesService.fetchCategory(category_id)
      .subscribe(category => {
        this.words = this.shuffle(category.words)
        this.loading = false
        this.next()
      })
  }

  shuffle(words: Word[]): Word[] {
    return words.sort(() => Math.random() - 0.5)
  }

  speakWord(word: string) {
    this.speachService.speak(word)
  }

  check(full: boolean = false) {
    if(full){
      return this.currentValue.toLowerCase() === this.currentWord.word.toLowerCase()
    }else{
      return this.currentWord.word.toLowerCase().indexOf(this.currentValue.toLowerCase()) !== 0
    }
  }

  next() {
    this.isFinal = false
    this.isIncorrect = false

    this.correctWord = ''
    this.currentValue = ''
    this.currentIndex++
    if(this.currentIndex < this.words.length){
      this.currentWord = this.words[this.currentIndex]
    }else{
      this.speachService.cancel()
      this.router.navigate([`/category`, this.category_id])
    }

    this.progress = this.currentIndex*100/this.words.length
    
  }

  onEnter(event: KeyboardEvent) {
    if(event.code === 'Enter'){

      if(this.correctWord){
        this.next()
        return
      }

      if(this.isFinal) {
        this.speachService.speak(this.currentWord.word)
        this.next()
      }else{
        this.speachService.speak(this.currentWord.word)
        this.correctWord = this.currentWord.word
      }

    }else{
      this.currentValue = (<HTMLInputElement>event.target).value
      this.isIncorrect = this.check()
      this.isFinal = this.check(true)
    }
    
  }

}
