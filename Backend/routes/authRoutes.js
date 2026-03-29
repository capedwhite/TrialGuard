const { register, login, logout, me } = require('../controllers/authController');
const zod = require('zod');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const router = require('express').Router();

const registerSchema = zod.object({
    email:zod.string().email({message:"Invalid email address"}),
    password:zod.string().min(8,{message:"Password must be at least 8 characters long"}),
confirmPassword:zod.string(),}).refine((data)=>data.password===data.confirmPassword,{message:"Passwords do not match",path:["confirmpassword"]})

const loginSchema = zod.object({
    email:zod.string().email({message:"Invalid email address"}),
      password: zod.string().min(1, { message: 'Password is required' }), 
})

router.post('/register',validate(registerSchema),register);
router.post('/login',validate(loginSchema),login);
router.post('/logout',logout);
router.get('/me', authMiddleware,me);
module.exports=router;