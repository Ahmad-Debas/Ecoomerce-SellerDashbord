import * as yup from "yup";

const RegisterSchema = yup.object({
  // --- Personal Info ---
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required("Confirm Password is required"),
  phone_number: yup.string().required("Phone is required"),
  phone_code: yup.string().required("Code is required"),
  
  // --- Location ---
  country_id: yup.string().required("Country is required"),
  currency_id: yup.string().required("Currency is required"),
  address: yup.string().required("Address is required"),

  // --- Store Info ---
  store_name_en: yup.string().required("Store Name (EN) is required"),
  store_name_ar: yup.string().required("Store Name (AR) is required"),
  // description_en:yup.string().required("Description (EN) is required"),
  // description_ar:yup.string().required("Description (AR) is required"),
// store_website: yup
//   .string()
//   .url("Must be a valid URL")
//   .notRequired()
//   .nullable(),  // --- Files ---
  logo: yup.mixed()
    .test("required", "Logo is required", (value) => value && value.length > 0),
  commercial_registration: yup.mixed()
    .test("required", "Document is required", (value) => value && value.length > 0),
}).required();

export default RegisterSchema;