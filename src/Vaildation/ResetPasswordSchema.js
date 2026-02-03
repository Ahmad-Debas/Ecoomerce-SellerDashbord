import * as yup from 'yup';

const ResetPasswordSchema = yup.object({

 otp : yup.string().required('Code is required'),
password : yup.string().min(6,'Password must be at least 6 characters').required('Password is required'),
password_confirmation : yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default ResetPasswordSchema;