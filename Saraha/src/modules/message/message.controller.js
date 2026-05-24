
import { Router } from "express";
import { sendMessage } from "./message.service.js";
import {
  decodeToken,
  fileFeieldValidation,
  generalValidationFields,
  localFileUpload,
  successResponse,
} from "../../common/utils/index.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./message.validation.js";
import {
  authentecation,
  authorization,
} from "../../middleware/authentication.middleware.js";



const router =Router()

router.post(
    "/:receiverId",
    async (req, res, next) => {
        if (req.headers.authorization) {
            const { user, decoded } = await decodeToken({ token: req.headers.authorization.split(" ")[1], tokenType: TokenTypeEnum.Access });
            req.user = user;
            req.decoded = decoded;
        }
        next();
    },
    localFileUpload({ validation: fileFeieldValidation.image, customPath: "Messages", maxSize: 1 }).array("attachments", 2),
    validation(validators.sendMessage),
    async (req, res, next) => {
        if (!req.body?.content && !req.files?.length) {
            throw BadRpcException({ message: "Validation error", extra: { key: "body", path: ['content'], message: "missing content" } })
        }
        const message = await sendMessage(req.params.receiverId, req.body,req.files  , req.user)
        return successResponse({ res, status: 201, data: { message } })
    }
 
)

router.get(
    "/list",
    authentecation(),
    async (req, res, next) => {
        const messages = await getMessages(req.user)
        return successResponse({ res, status: 200, data: { messages } })
    }
)

router.get(
    "/:messageId",
   authentecation(),
    validation(validators.getMessage),
    async (req, res, next) => {
        const message = await getMessage(req.params.messageId, req.user)
        return successResponse({ res, status: 200, data: { message } })
    }
)

router.delete(
    "/:messageId",
    authentecation(),
    validation(validators.getMessage),
    async (req, res, next) => {
        const message = await deleteMessage(req.params.messageId, req.user)
        return successResponse({ res, status: 200, data: { message } })
    }
)

export default router;