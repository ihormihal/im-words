import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'

const apiUrl: string = 'https://mycode.in.ua/api/ed-words/api.php?'

export interface Word {
    word: string,
    translations: string[]
}

export interface Category {
	id: string,
  lang?: string,
	title: string,
	length: number,
	words?: Word[]
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
	constructor(private http: HttpClient) { }

	fetchCategories(): Observable<Category[]> {
		return this.http.post<Category[]>(apiUrl + 'action=GET_ED_CATEGORIES', { })
	}

	fetchCategory(id: number): Observable<Category> {
        return this.http.post<Category>(apiUrl+'action=GET_ED_WORDS', { id })
    }
}
