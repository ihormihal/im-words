import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}


@Component({
  selector: 'app-microphone',
  templateUrl: './microphone.component.html',
  styleUrls: ['./microphone.component.scss']
})
export class MicrophoneComponent implements OnInit {

  private recognition: any;
  public active = false;
  @Input() target: string;
  @Output() success = new EventEmitter();
  @Output() fail = new EventEmitter();
  @Output() enter = new EventEmitter();

  constructor() {
  }

  private check(result) {
    this.enter.emit(result);
    // if (result === this.target.toLowerCase()) {
    //   this.enter.emit();
    // }
  }

  ngOnInit() {
    this.recognition = new (<IWindow> window).webkitSpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.active = true;
    };
    this.recognition.onend = () => {
      this.active = false;
    };
    this.recognition.onresult = (event) => {
      if (!event.results) {
        this.recognition.stop();
        return;
      }

      if (event.results[0].isFinal) {
        this.check(event.results[0][0].transcript.toLowerCase().trim());
      }
    };

  }

  public toggleMic() {
    if (this.active) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

}
