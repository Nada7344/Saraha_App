import { NODE_ENV } from "../../../../config/config.service.js";
import multer from 'multer'

// general customized error method
export const CustomResponse = ({ message = "Error", status = 400, extra = undefined } = {}) => {
  throw new Error(message, { cause: { status, extra } });
};

// error-templates

export const BadRequestException = ({ message = "BadRequestException", extra = undefined } = {}) => {
  return CustomResponse({ message, status: 400, extra });
};

export const ConflictException = ({ message = "ConflictException", extra = undefined } = {}) => {
  return CustomResponse({ message, status: 409, extra });
};

export const UnauthorizedException = ({ message = "UnauthorizedException", extra = undefined } = {}) => {
  return CustomResponse({ message, status: 401, extra });
};

export const NotFoundException = ({ message = "NotFoundException", extra = undefined } = {}) => {
  return CustomResponse({ message, status: 404, extra });
};

export const ForbiddenException = ({ message = "ForbiddenException", extra = undefined } = {}) => {
  return CustomResponse({ message, status: 403, extra });
};

// Fixed error structure
export const globalErrorHandling = (error, req, res, next) => {
  let status = error.cause?.status ?? 500;
  const mode = NODE_ENV === "production";
  const defaultErrorMessage = "Something went wrong Server error";
  const displayErrorMessage = error.message || defaultErrorMessage;
  
  if (error instanceof multer.MulterError) {
  status=400
  }
  return res.status(status).json({
    status,
    errorMessage : mode ? status== 500?  defaultErrorMessage : displayErrorMessage : displayErrorMessage,
    extra :error?.cause?.extra||undefined,
        stack : mode ? undefined :error.stack,

  });
};