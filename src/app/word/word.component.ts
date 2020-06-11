import {Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, OnDestroy} from '@angular/core';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {map, tap, filter, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {Word, CategoriesService} from '../services/categories.service';
import {SpeachService} from '../services/speach.service';

export interface Word {
  word: string;
  translations: string[];
}

const TIME_SHOW_DELAY = 300;
const KEYS = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
  'z', 'x', 'c', 'v', 'b', 'n', 'm',
  ' ', '-', 'Backspace', 'Enter'
];

@Component({
  selector: 'app-word',
  templateUrl: './word.component.html',
  styleUrls: ['./word.component.scss']
})
export class WordComponent implements OnInit, OnDestroy {

  public loading: boolean;
  private categoryId: number;
  private total: number;
  public words: Word[];
  public currentWord: Word;
  public currentValue: string;
  public show: boolean;
  public hint: string;
  public progress: number;
  public isError: boolean; // in the process of typing
  public isFinal: boolean; // full word has been typed
  public isRecording: boolean;
  private recSubscibation: Subscription;
  private recActiveSubscibation: Subscription;

  @ViewChild('input', {static: false}) input: ElementRef;

  // tmp
  public reverse: boolean;


  constructor(
    private categoriesService: CategoriesService,
    public speechService: SpeachService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.categoryId = params.category_id;
      this.fetchWords();
    });

    fromEvent(document, 'keyup')
      .pipe(
        filter((e: KeyboardEvent) => e.code === 'ArrowRight'),
        tap(() => {
          this.showWord();
        }),
        debounceTime(TIME_SHOW_DELAY)
      )
      .subscribe((e: KeyboardEvent) => {
        this.nextWord(true);
      });

    this.recActiveSubscibation = this.speechService.recActive
      .subscribe(active => {
        this.isRecording = active;
        this.cdRef.detectChanges();
    });

    this.recSubscibation = this.speechService.rec
      .pipe(
        distinctUntilChanged()
      )
      .subscribe((variants: string[]) => {
        if (variants.length && variants[0] === 'stop') {
          this.showWord();
          this.speakWord();
          setTimeout(() => {
            if (!this.isRecording) {
              this.speechService.startRec();
            }
          }, 2000);
          return;
        }
        if (variants.length && variants[0] === 'next') {
          this.nextWord();
          setTimeout(() => {
            if (!this.isRecording) {
              this.speechService.startRec();
            }
          }, 500);
          return;
        }
        if (variants.includes(this.currentWord.word)) {
          this.currentValue = this.currentWord.word;
          this.checkWord();
          this.checkFinal();
          this.showWord();
          this.speakWord();
          setTimeout(() => {
            this.nextWord(true);
            if (!this.isRecording) {
              this.speechService.startRec();
            }
          }, 1000);
        } else {
          this.currentValue = variants.length ? variants[0] : '';
          this.checkWord();
          setTimeout(() => {
            if (this.isError && !this.isRecording) {
              this.speechService.startRec();
            }
          }, 500);
        }
      });
  }

  ngOnDestroy(): void {
    this.recSubscibation.unsubscribe();
    this.recActiveSubscibation.unsubscribe();
  }

  private fetchWords() {
    this.loading = true;
    this.categoriesService.fetchCategory(this.categoryId)
      .subscribe(category => {
        this.total = category.length;
        this.words = category.words;
        this.loading = false;
        this.nextWord();
        setTimeout(() => {
          this.typeListener();
        });
      });
  }

  private typeListener() {
    if (!this.input) {
      return;
    }
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        filter((e: KeyboardEvent) => KEYS.indexOf(e.key) > -1),
        debounceTime(100)
      )
      .subscribe((e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          if (this.show) {
            this.nextWord();
            return;
          }
          this.showWord();
          this.speakWord();
        } else {
          // this.currentValue = (e.target as HTMLInputElement).value;
          this.checkWord();
        }
      });
  }

  private showWord() {
    this.show = true;
  }

  private speakWord() {
    this.speechService.speak(this.currentWord.word);
  }


  private nextWord(removeFromList: boolean = false): void {
    this.currentValue = '';
    this.isError = false;
    this.isFinal = false;
    this.show = false;

    if (removeFromList) {
      this.words.splice(0, 1);
    }
    if (this.words.length === 0) {
      this.router.navigate([`/category`, this.categoryId]);
      return;
    }
    this.shuffle();
    this.currentWord = this.words[0];
    if (this.currentWord.word.indexOf('to ') === 0) {
      this.hint = 'to ***';
    }
    this.progress = 100 * (1 - this.words.length / this.total);
  }

  private shuffle(): void {
    if (this.words.length < 2) {
      return;
    }
    const nextWord = this.words[0].word;
    do {
      this.words = this.words.sort(() => Math.random() - 0.5);
    } while (this.words[0].word === nextWord);
  }

  public toggleRec() {
    if (!this.isRecording) {
      // start
      this.speechService.startRec();
    } else {
      // stop
      this.speechService.stopRec();
    }
  }

  private checkTypingError() {
    const val = this.currentValue.toLowerCase();
    if (this.reverse) {
      for (const tr of this.currentWord.translations) {
        if (tr.toLowerCase().indexOf(val) === 0) {
          return false;
        }
      }
      return true;
    } else {
      return this.currentWord.word.toLowerCase().indexOf(val) !== 0;
    }
  }

  private checkFinal() {
    const val = this.currentValue.toLowerCase();
    if (this.reverse) {
      for (const tr of this.currentWord.translations) {
        if (val === tr.toLowerCase()) {
          return true;
        }
      }
      return false;
    } else {
      return val === this.currentWord.word.toLowerCase();
    }
  }

  private checkWord() {
    this.isError = this.checkTypingError();
    this.isFinal = this.checkFinal();
  }

}
