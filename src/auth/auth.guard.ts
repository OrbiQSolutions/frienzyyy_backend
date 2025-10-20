
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }
  private readonly logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    this.logger.log(`token: ${token}`);
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET
        }
      );
      request.user = payload;
      console.log(payload);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = String(request.headers[String(process.env.TOKEN_KEY)]).split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}