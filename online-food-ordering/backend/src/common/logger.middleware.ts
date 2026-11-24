import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const timestamp = new Date().toISOString();
    const { method, originalUrl } = req;
    console.log(`[REQUEST LOGGER] [${timestamp}] ${method} ${originalUrl}`);
    next();
  }
}
