// auth/ws.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }
  private readonly logger = new Logger(WsGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();
      console.log(client)
      const token = this.extractTokenFromHandshake(client);
      this.logger.log(`token: ${token}`);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const payload = await this.jwtService.verifyAsync(
          token,
          {
            secret: process.env.JWT_SECRET,
          }
        );
        console.log("payload: ", payload);
        console.log(client.handshake.auth);
        client.handshake.auth = { ...client.handshake.auth, ...payload };
      } catch (error) {
        this.logger.error(`Invalid or expired token: ${error.message}`);
        throw new UnauthorizedException('Invalid or expired token');
      }
      return true;
    } catch (exception) {
      throw new UnauthorizedException;
    }
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    // Check headers (if sent via WebSocket upgrade request)
    const authHeader = client.handshake.headers[String(process.env.TOKEN_KEY)];
    console.log(authHeader);
    if (authHeader) {
      const [type, token] = String(authHeader).split(' ');
      return type === 'Bearer' ? token : undefined;
    }

    const tokenFromQuery = client.handshake.query.token as string;
    if (tokenFromQuery) {
      const [type, token] = String(tokenFromQuery).split(' ');
      return type === 'Bearer' ? token : undefined;
    }

    const tokenFromAuth = client.handshake.auth.token as string;
    return tokenFromAuth || undefined;
  }
}