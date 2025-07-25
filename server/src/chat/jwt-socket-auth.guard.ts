import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class JwtSocketAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1] || client.handshake.headers?.cookie?.split('=').pop();
    if (!token) return false;

    try {
      const user = this.jwtService.verify(token);
      client.handshake['user'] = user;
      return true;
    } catch (e) {
      return false;
    }
  }
}
