import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly VALID_API_KEY = process.env.API_KEY || 'food-ordering-secret-key-2026';

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || request.query['api_key'];

    if (!apiKey || apiKey !== this.VALID_API_KEY) {
      throw new UnauthorizedException(
        `Invalid or missing API key. Please provide 'x-api-key: ${this.VALID_API_KEY}' header.`
      );
    }

    return true;
  }
}
