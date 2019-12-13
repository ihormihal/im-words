import { Injectable } from '@angular/core'

@Injectable({providedIn: 'root'})
export class SpeachService {

    speak(word: string): void {
        let utterThis = new SpeechSynthesisUtterance(word)
        window.speechSynthesis.speak(utterThis)
    }
}