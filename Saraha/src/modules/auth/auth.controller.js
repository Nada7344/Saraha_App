import { Router } from 'express'
import {  confirmEmail, forgotPasswordOtp, login, resendConfirmEmail, resetForgotPasswordOtp, signup, signupWithGmail, verifyForgotPasswordOtp } from './auth.service.js';
import { successResponse } from '../../common/utils/response/success.response.js';
import * as validators from './auth.validation.js'
import { validation } from '../../middleware/validation.middleware.js';
const router = Router(); 


router.post("/signup", validation(validators.signup),async (req, res, next) => {
   
    const account = await signup(req.body);    
    return successResponse({res ,status:201 , data :{account}})
})

router.patch("/confirm-email", validation(validators.confirmEmail),async (req, res, next) => {
   
    const account = await confirmEmail(req.body);    
    return successResponse({res})
});

router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail),async (req, res, next) => {
   
    const account = await resendConfirmEmail(req.body);    
    return successResponse({res})
}); 

router.patch("/request-forgot-password", validation(validators.resendConfirmEmail),async (req, res, next) => {
   
    const account = await forgotPasswordOtp(req.body);    
    return successResponse({res})
});

router.patch("/verify-forgot-password", validation(validators.confirmEmail),async (req, res, next) => {
   
    const account = await verifyForgotPasswordOtp(req.body);    
    return successResponse({res})
});

router.patch("/reset-forgot-password", validation(validators.resetForgotPassword),async (req, res, next) => {
   
    const account = await resetForgotPasswordOtp(req.body);    
    return successResponse({res})
});


router.post("/signup/gmail", async (req, res, next) => {
    const {status ,credentials} = await signupWithGmail(req.body.idToken,`${req.protocol}//${req.host}`);    
    return successResponse({res ,status , data :{...credentials}})
})
router.post("/login", validation(validators.login),async (req, res, next) => {
    const credentials = await login(req.body,`${req.protocol}//${req.host}`)
    return successResponse({res,  data :{...credentials } })
})


export default router