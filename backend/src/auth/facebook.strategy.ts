import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-facebook";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(private config: ConfigService, private authService: AuthService) {
    super({
      clientID: config.get<string>("FACEBOOK_APP_ID") || "facebook-app-id",
      clientSecret: config.get<string>("FACEBOOK_APP_SECRET") || "facebook-app-secret",
      callbackURL: config.get<string>("FACEBOOK_CALLBACK_URL") || "http://localhost:4000/api/auth/facebook/callback",
      scope: ["email"],
      profileFields: ["id", "emails", "name", "photos"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: any): Promise<any> {
    const { id, emails, name, photos } = profile;
    const user = await this.authService.validateOAuthUser({
      provider: "facebook",
      providerId: id,
      email: emails?.[0]?.value,
      name: name?.givenName + " " + name?.familyName,
      avatar: photos?.[0]?.value,
    });
    done(null, user);
  }
}
