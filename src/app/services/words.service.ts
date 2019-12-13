import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'

export interface Word {
    id?: number,
    category_id: number,
    text: string,
    translations: string[]
}

@Injectable({providedIn: 'root'})
export class WordsService {
    constructor(private http: HttpClient) {}


    addTodo(word: Word): Observable<Word> {
        return this.http.post<Word>('https://mycode.in.ua/api/im-translator/api.php?action=ADD', word)
    }

    fetchWords(category_id: number): Observable<Word[]> {
        return this.http.post<Word[]>('https://mycode.in.ua/api/im-translator/api.php?action=WORDS', { category_id })
    }

    removeWord(id: number): Observable<void> {
        return this.http.post<void>('https://mycode.in.ua/api/im-translator/api.php?action=DELETE', { id })
    }
}