import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

@Injectable({providedIn: 'root'})
export class SpeachService {

  public rec = new Subject<string[]>();
  public recActive = new Subject<boolean>();
  private recognition: any;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    this.recognition = new (<IWindow> window).webkitSpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.maxAlternatives = 50;

    this.recognition.onstart = () => {
      this.recActive.next(true);
    };

    this.recognition.onend = () => {
      this.recActive.next(false);
    };

    this.recognition.onresult = (event) => {
      const res: string[] = [];
      for (let i = 0; i < event.results[0].length; i++) {
        res.push(event.results[0][i].transcript.trim().toLowerCase());
      }
      this.rec.next(res);
    };
  }


  public startRec(): Observable<string[]> {
    this.recognition.start();
    return this.rec;
  }

  public stopRec() {
    this.recognition.stop();
  }

  public speak(word: string): void {
    const utterThis = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterThis);
  }

  cancel(): void {
    window.speechSynthesis.cancel();
  }


}
