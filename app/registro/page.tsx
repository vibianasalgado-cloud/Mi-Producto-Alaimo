import AuthForm from '../AuthForm';

export const metadata = { title: 'Crear cuenta' };

export default function Registro() {
  return <AuthForm modo="registro" />;
}
