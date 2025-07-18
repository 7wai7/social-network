import { HttpException, HttpStatus } from '@nestjs/common';

interface FieldError {
  field?: string;
  message: string;
  code: string;
}

export class HttpExceptionCode extends HttpException {
  constructor(errors: FieldError[], status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ errors }, status);
  }
}
