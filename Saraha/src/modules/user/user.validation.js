import joi from 'joi'
import { generalValidationFields } from "../../common/utils/validation.js";
import { fileFeieldValidation } from '../../common/utils/index.js';

export const shareProfile={
    params:joi.object().keys({
        userId :generalValidationFields.id.required()
    }).required()
}
export const profileImage = {
  file: generalValidationFields.file(fileFeieldValidation.image).required(),
};

export const profileCoverImage = {
  files: joi
    .array()
    .items(generalValidationFields.file(fileFeieldValidation.image).required())
    .min(1)
    .max(2).required()
};

export const profileAttachments = {
  files: joi.object().keys({
    profileImage:joi.array().items(
        generalValidationFields.file(fileFeieldValidation.image).required()
    ).length(1).required,

    profileCoverImage:joi.array().items(
        generalValidationFields.file(fileFeieldValidation.image).required()
    ).min(1).max(2).required()
  }).required()
}
