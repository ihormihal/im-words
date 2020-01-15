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
		this.words = this.words.sort(() => Math.random() - 0.5)
	}

	speakWord(word: string) {
		this.speachService.speak(word)
	}

	check(full: boolean = false) {
		if (full) {
			return this.currentValue.toLowerCase() === this.currentWord.word.toLowerCase()
		} else {
			return this.currentWord.word.toLowerCase().indexOf(this.currentValue.toLowerCase()) !== 0
		}
	}

	next(remove: boolean = false) {
		this.isFinal = false
		this.isIncorrect = false
		this.correctWord = ''
		this.currentValue = ''

		if(remove) this.words.splice(0, 1)
		if(this.words.length == 0){
			this.speachService.cancel()
			this.router.navigate([`/category`, this.category_id])
		}
		this.shuffle()


		this.currentWord = this.words[0]
		this.progress = 100 * (1 - this.words.length / this.length)

	}

	onEnter(event: KeyboardEvent) {
		if (event.code === 'Enter') {

			//if hint
			if (this.correctWord) {
				this.next()
				return
			}

			if (this.isFinal) {
				//if correct -> just remove and carry on
				this.speachService.speak(this.currentWord.word)
				this.next(true)
			} else {
				//if incorrect -> show hint and to nothing
				this.speachService.speak(this.currentWord.word)
				this.correctWord = this.currentWord.word
			}

		} else {
			this.currentValue = (<HTMLInputElement>event.target).value
			this.isIncorrect = this.check()
			this.isFinal = this.check(true)
		}

	}

}
