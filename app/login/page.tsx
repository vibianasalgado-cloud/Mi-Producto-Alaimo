import AuthForm from '../AuthForm';

export const metadata = { title: 'Entrar' };

export default function Login() {
  return <AuthForm modo="login" />;
}
