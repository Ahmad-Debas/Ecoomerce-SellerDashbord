import * as yup from 'yup';

const ForgetPasswordSchema = yup.object({

 email : yup.string().email('Invalid email format').required('Email is reqieured'),
});

export default ForgetPasswordSchema;