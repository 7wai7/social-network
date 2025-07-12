import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const req = context.switchToHttp().getRequest();

            const authHeader = req.headers.authorization;
                        
            if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
            }

            const [bearer, token] = authHeader.split(' ');

            if(bearer !== "Bearer" || !token) {
                throw new UnauthorizedException({message: "Unauthorized"})
            }

            const user = this.jwtService.verify(token);
            req.user = user;
            console.log('addFollowing:', typeof user.addFollowing);

            return true;
        } catch (error) {
            console.log(error);
            
            throw new UnauthorizedException({message: "Unauthorized"})
        }
    }
    
}