import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthService {
  userProfile: any;
  auth0 = new auth0.WebAuth({
    clientID: environment.authConfig.clientID,
    domain: environment.authConfig.domain,
    responseType: 'token id_token',
    audience: 'https://ITsMyTown',
    //audience: `https://${AUTH_CONFIG.domain}/userinfo`,
    redirectUri: environment.authConfig.callbackURL,
    scope: 'openid profile'
  });

  constructor(public router: Router) {}

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      console.log(authResult);
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
      }    
    });
  }

  private setSession(authResult): void {

    let expiresAt, scopes;
    // Set the time that the Access Token will expire at
    expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    scopes = authResult.scope;
    scopes = scopes.split(' ');
    console.log(authResult);
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    console.log(authResult.accessToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('role', authResult.idTokenPayload['https://example.com/roles'][0]);
    localStorage.setItem('scopes', JSON.stringify(scopes));

  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.clear();
    // Go back to the home route
    this.router.navigate(['/login']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  public getProfile(cb): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }
  
    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      localStorage.setItem('user_id',profile.sub);
      if (profile) {
        self.userProfile = profile;
      }
      console.log(profile);
      cb(err, profile);
    });
  }

}