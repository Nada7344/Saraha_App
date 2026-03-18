import { Router } from "express";
import {
  logout,
  profile,
  profileCoverImages,
  profileImage,
  rotateToken,
  shareProfile,
} from "./user.service.js";
import {
  fileFeieldValidation,
  successResponse,
} from "../../common/utils/index.js";
import {
  authentecation,
  authorization,
} from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { endpoint } from "./user.authorization.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { localFileUpload } from "../../common/utils/multer/local.multer.js";
import multer from "multer";

const router = Router();

router.post(
  "/logout",
  authentecation(),
  async (req, res, next) => {
    const result = await logout(req.user);
    return successResponse({ res, data: {result } });
  },
);



router.get(
  "/",
  authentecation(),
  authorization(endpoint.profile),
  async (req, res, next) => {
    const account = await profile(req.user);
    return successResponse({ res, data: { account } });
  },
);

router.get(
  "/:userId/share-profile",
  validation(validators.shareProfile),
  async (req, res, next) => {
    const account = await shareProfile(req.params.userId);
    return successResponse({ res, data: { account } });
  },
);

router.patch(
  "/profile-image",
  authentecation(),
  localFileUpload({
    customPath: "/user/profile",
    validation: fileFeieldValidation.image,
  }).single("attachment"),
  validation(validators.profileImage),
  async (req, res, next) => {
    const account = await profileImage(req.user ,req.file)
    return successResponse({ res, data: { account } });
  },
);

router.patch(
  "/profile-cover-images",
  authentecation(),
  localFileUpload({
    customPath: "/user/profile/cover",
    validation: fileFeieldValidation.image,
  }).array("attachments", 2),
    validation(validators.profileCoverImage),
  async (req, res, next) => {
    const account = await profileCoverImages(req.user, req.files);
    return successResponse({ res, data: { account } });
  },
);

router.get(
  "/rotate-token",
  authentecation(TokenTypeEnum.Referesh),
  async (req, res, next) => {
    const credentials = await rotateToken(
      req.user,
      `${req.protocol}//${req.host}`,
    );
    return successResponse({ res, data: { credentials } });
  },
);

export default router;
