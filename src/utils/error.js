export class PrismaError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BusinessError extends PrismaError { }

export class JsonError extends BusinessError {
  constructor(message, source) {
    super(message);
    this.message = this.message.replace(/JSON/, `'${source}'`);
    this.source = source;
  }
}

export class HttpError extends BusinessError {
  constructor(status, statusText) {
    if (!statusText) {
      switch(status) {
        case 401:
          statusText = 'Unauthorazed';
          break;
        case 403:
          statusText = 'Forbidden';
          break;
        case 500:
          statusText = 'Internal Server Error';
        break;
        default:
          statusText = 'Undefined Error';
          break;
      }
    }
    super(`${status}: ${statusText}`);
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message) {
    super(400, 'Bad Request');
    if (message) {
      this.message = message;
    }
  }
}

export class InfrastructureError extends PrismaError { }

export class NetworkError extends InfrastructureError {
  constructor() {
    super('Network error occurred');
  }
}