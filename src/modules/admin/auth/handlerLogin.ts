import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

import { HandlerState, State } from 'types/Common';

interface LoginHandlerState {
  email: HandlerState<string>;
  password: HandlerState<string>;
  btn: HandlerState<State>;
}
export default async function mod_AdminLogin_handlerLogin(
  e: React.FormEvent<HTMLFormElement>,
  state: LoginHandlerState,
  successCallback?: () => void,
  errorCallback?: (error: any) => void,
) {
  e.preventDefault();

  state.btn.set('loading');
  try {
    const login = await signIn('credentials', {
      email: state.email.get,
      password: state.password.get,
      redirect: false,
    });

    if (login?.error) throw new Error(login.error);
    toast.success('Login success!');

    if (successCallback) successCallback();
  } catch (error: any) {
    console.error(error);
    toast.error(error.message);

    if (errorCallback) errorCallback(error);
  } finally {
    state.btn.set('idle');
  }
}
