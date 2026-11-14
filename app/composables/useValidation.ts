import { ref } from "vue";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const loginMinLength = 5;
const passwordMinLength = 6;

type Errors<T> = Ref<Partial<Record<keyof T, string>>>;

interface SignInForm {
  email: string;
  password: string;
}

interface SignUpForm {
  login: string;
  email: string;
  password: string;
  // repeatPassword: string;
}

interface ResetPasswordForm {
  email: string;
}

// interface PostAuthForm {
//   first_name: string;
//   last_name: string;
//   birth_date: string;
//   gender: string;
//   country: string;
//   city: string;
//   telephone: string;
//   source: string;
// }

export function useSignInValidation() {
  const errors: Errors<SignInForm> = ref({});

  const validate = (form: SignInForm) => {
    errors.value = {};

    if (!form.email) errors.value.email = "Введи email";
    else if (!emailRegex.test(form.email)) errors.value.email = "Похоже, в адресе опечатка";

    if (!form.password) errors.value.password = "Введи пароль";
    else if (form.password.length < passwordMinLength)
      errors.value.password = `Пароль - минимум ${passwordMinLength} символов`;

    return Object.keys(errors.value).length === 0;
  };

  return { errors, validate };
}

export function useSignUpValidation() {
  const errors: Errors<SignUpForm> = ref({});

  const validate = (form: SignUpForm) => {
    errors.value = {};

    if (!form.login) errors.value.login = "Введи логин";
    else if (form.login.length < loginMinLength)
      errors.value.login = `Логин - минимум ${loginMinLength} символов`;

    if (!form.email) errors.value.email = "Введи email";
    else if (!emailRegex.test(form.email)) errors.value.email = "Похоже, в адресе опечатка";

    if (!form.password) errors.value.password = "Введи пароль";
    else if (form.password.length < passwordMinLength)
      errors.value.password = `Пароль - минимум ${passwordMinLength} символов`;

    // if (!form.repeatPassword)
    //   errors.value.repeatPassword = "Please repeat your password";
    // else if (form.password !== form.repeatPassword)
    //   errors.value.repeatPassword = "Passwords do not match";

    return Object.keys(errors.value).length === 0;
  };

  return { errors, validate };
}

export function useResetPasswordValidation() {
  const errors: Errors<ResetPasswordForm> = ref({});

  const validate = (form: ResetPasswordForm) => {
    errors.value = {};

    if (!form.email) errors.value.email = "Введи email";
    else if (!emailRegex.test(form.email)) errors.value.email = "Похоже, в адресе опечатка";

    return Object.keys(errors.value).length === 0;
  };

  return { errors, validate };
}

// export function usePostAuthValidation() {
//   const errors: Errors<PostAuthForm> = ref({});

//   const validate = (form: PostAuthForm) => {
//     errors.value = {};

//     if (!form.first_name) errors.value.first_name = "First name is required";
//     else if (form.first_name.length < 3)
//       errors.value.first_name = `First name must be at least 3 characters`;

//     if (!form.last_name) errors.value.last_name = "Last name is required";
//     else if (form.first_name.length < 3)
//       errors.value.first_name = `First name must be at least 3 characters`;

//     if (!form.birth_date) errors.value.birth_date = "Birth date is required";
//     if (!form.gender) errors.value.gender = "Gender is required";
//     if (!form.country) errors.value.country = "Country is required";
//     if (!form.city) errors.value.city = "City is required";
//     if (!form.telephone) errors.value.telephone = "Phone number is required";
//     if (!form.source) errors.value.source = "Source is required";

//     return Object.keys(errors.value).length === 0;
//   };

//   return { errors, validate };
// }
