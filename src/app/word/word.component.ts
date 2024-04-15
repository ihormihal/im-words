import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, OnDestroy, Input, Inject } from '@angular/core';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {map, tap, filter, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {Word, CategoriesService} from '../services/categories.service';
import {SpeachService} from '../services/speach.service';
import { DOCUMENT } from '@angular/common';

const trimWord = (text: string): string => {
  let word: string = text.toLowerCase();
  word = word.replace(/(\?|¿|¡|!|,|\.)/g, '');

  word = word.replace(/á/g, 'a');
  word = word.replace(/à/g, 'a');
  word = word.replace(/é/g, 'e');
  word = word.replace(/í/g, 'i');
  word = word.replace(/ò/g, 'o');
  word = word.replace(/ó/g, 'o');
  word = word.replace(/ñ/g, 'n');
  return word;
};

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
  public uiTransform: string[] = [];
  public letters: string[] = [];

  @Input() lang: string;
  @ViewChild('input', {static: false}) input: ElementRef;

  // tmp
  public reverse: boolean;


  constructor(
    private categoriesService: CategoriesService,
    public speechService: SpeachService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
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

    this.recSubscribe();

  }

  ngOnDestroy(): void {
    this.recSubscibation && this.recSubscibation.unsubscribe();
    this.recActiveSubscibation && this.recActiveSubscibation.unsubscribe();
  }


  private recSubscribe() {
    // this.recActiveSubscibation = this.speechService.recActive
    //   .subscribe(active => {
    //     this.isRecording = active;
    //     this.cdRef.detectChanges();
    // });
    //
    // this.recSubscibation = this.speechService.rec
    //   .pipe(
    //     distinctUntilChanged()
    //   )
    //   .subscribe((variants: string[]) => {
    //     if (variants.length && variants[0] === 'stop') {
    //       this.showWord();
    //       this.speakWord();
    //       setTimeout(() => {
    //         if (!this.isRecording) {
    //           this.speechService.startRec();
    //         }
    //       }, 2000);
    //       return;
    //     }
    //     if (variants.length && variants[0] === 'next') {
    //       this.nextWord();
    //       setTimeout(() => {
    //         if (!this.isRecording) {
    //           this.speechService.startRec();
    //         }
    //       }, 500);
    //       return;
    //     }
    //     if (variants.includes(this.currentWord.word)) {
    //       this.currentValue = this.currentWord.word;
    //       this.checkWord();
    //       this.checkFinal();
    //       this.showWord();
    //       this.speakWord();
    //       setTimeout(() => {
    //         this.nextWord(true);
    //         if (!this.isRecording) {
    //           this.speechService.startRec();
    //         }
    //       }, 1000);
    //     } else {
    //       this.currentValue = variants.length ? variants[0] : '';
    //       this.checkWord();
    //       setTimeout(() => {
    //         if (this.isError && !this.isRecording) {
    //           this.speechService.startRec();
    //         }
    //       }, 500);
    //     }
    //   });
  }

  private fetchWords() {
    this.loading = true;
    this.categoriesService.fetchCategory(this.categoryId)
      .subscribe(category => {
        this.document.documentElement.lang = category.lang || 'en-US';
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
            this.nextWord(this.isFinal);
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

  public speakWord() {
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

    this.letters = trimWord(this.currentWord.word).split('');
    this.uiTransform = this.letters.map(r => {
      const x = Math.random() * window.outerWidth;
      const y = Math.random() * 300;
      return `translate3d(${x}px, ${y}px, 0)`;
    });
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
    const val: string = this.currentValue.toLowerCase();
    const word: string = trimWord(this.currentWord.word);
    if (this.reverse) {
      for (const tr of this.currentWord.translations) {
        if (tr.toLowerCase().indexOf(val) === 0) {
          return false;
        }
      }
      return true;
    } else {
      return word.indexOf(val) !== 0;
    }
  }

  private checkFinal() {
    const val = this.currentValue.toLowerCase();
    if (this.reverse) {
      for (const tr of this.currentWord.translations) {
        if (val === trimWord(tr)) {
          return true;
        }
      }
      return false;
    } else {
      return val === trimWord(this.currentWord.word);
    }
  }

  private checkWord() {
    this.isError = this.checkTypingError();
    this.isFinal = this.checkFinal();
  }

  public isTyped(index: number) {
    const char = this.letters.join('').charAt(index).toLowerCase();
    const typedChar = this.currentValue.charAt(index).toLowerCase();
    return char === typedChar;
  }
}
