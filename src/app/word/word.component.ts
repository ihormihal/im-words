import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, Params } from '@angular/router'
import { Word, CategoriesService } from './../services/categories.service'
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

	reverse = false
	category_id: number = null
	loading: boolean = false

	length: number = 0
	words: Word[] = []
	//wordsAwait: Word[] = []

	progress: number = 0
	// currentIndex: number = -1
	currentWord: Word
	currentValue: string = ''
	correctWord: string = ''
	hint: string = ''

	isIncorrect: boolean = true
	isFinal: boolean = false

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
				this.length = category.length
				this.words = category.words
				this.loading = false
				this.next()
			})
	}

	shuffle(): void {
		if(this.words.length < 2) return
		let nextWord = this.words[0].word
		do {
			this.words = this.words.sort(() => Math.random() - 0.5)
		} while (this.words[0].word === nextWord)
	}

	speakWord() {
		this.speachService.cancel()
		this.speachService.speak(this.currentWord.word)
	}

	checkIncorrect() {
		const val = this.currentValue.toLowerCase()
		if(this.reverse){
			for(let tr of this.currentWord.translations){
				if(tr.toLowerCase().indexOf(val) === 0) return false
			}
			return true
		}else{
			return this.currentWord.word.toLowerCase().indexOf(val) !== 0
		}
	}

		
	checkFinal() {
		const val = this.currentValue.toLowerCase()
		if(this.reverse){
			for(let tr of this.currentWord.translations){
				if(val === tr.toLowerCase()) return true;
			}
			return false
		}else{
			return val === this.currentWord.word.toLowerCase()
		}
	}

	next(remove: boolean = false) {
		this.isFinal = false
		this.isIncorrect = false
		this.correctWord = ''
		this.currentValue = ''
		this.hint = ''

		if(remove) this.words.splice(0, 1)
		if(this.words.length == 0){
			this.speachService.cancel()
			this.router.navigate([`/category`, this.category_id])
			return
		}
		this.shuffle()


		this.currentWord = this.words[0]
		if(this.currentWord.word.indexOf('to ') === 0) this.hint = 'to ***'
		this.progress = 100 * (1 - this.words.length / this.length)

	}

	onEnter(event: KeyboardEvent) {
		if(event.code === 'ArrowRight'){
			this.speakWord()
			this.next(true)
			return
		}
		if (event.code === 'Enter') {

			//if hint
			if (this.correctWord) {
				this.next()
				return
			}

			if (this.isFinal) {
				//if correct -> just remove and carry on
				this.speakWord()
				this.next(true)
			} else {
				//if incorrect -> show hint and to nothing
				this.speakWord()
				this.correctWord = this.reverse ? this.currentWord.translations.join(', ') : this.currentWord.word
			}

		} else {
			this.currentValue = (<HTMLInputElement>event.target).value
			this.isIncorrect = this.checkIncorrect()
			this.isFinal = this.checkFinal()
		}

	}

}
