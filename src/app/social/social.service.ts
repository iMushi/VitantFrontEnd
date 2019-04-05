import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import { ContactModel } from '../models/contact.model';

@Injectable()
export class SocialService {

  constructor (private http: HttpClient) {
  }

  // Get social feed posts
  getFeed () {
    return this.http.get('assets/data/feed.json').map((res: any) => res.json());
  }

  getContacts () {
    return this.http.get<Array<ContactModel>>('assets/data/contacts.json');
  }
}
