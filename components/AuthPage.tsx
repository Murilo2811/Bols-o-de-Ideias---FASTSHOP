import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';
import Logo from './Logo';

const PasswordCriterion: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <div className={`flex items-center gap-2 transition-colors text-sm ${isValid ? 'text-gray-200' : 'text-gray-500'}`}>
        {isValid ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
        )}
        <span>{text}</span>
    </div>
);


const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, register, isLoading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  
  useEffect(() => {
    // Força o modo escuro para a página de login
    document.documentElement.classList.add('dark');
    
    // Na desmontagem do componente (após o login), o ThemeProvider assumirá o controle
    // e definirá a classe correta ('light' ou 'dark') com base na preferência do usuário.
    // Nenhuma limpeza é necessária aqui para evitar um flash de tema claro.
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Real-time validation for register view
    if (!isLoginView) {
      setPasswordCriteria({
        minLength: newPassword.length >= 8,
        hasLowercase: /[a-z]/.test(newPassword),
        hasUppercase: /[A-Z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (isLoginView) {
            await login(email, password);
        } else {
            const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
            if (!isPasswordValid) {
                return;
            }
            await register(name, email, password);
        }
    } catch (err) {
        // Erro já é tratado no AuthContext, este catch evita erros não capturados no console.
    }
  };
  
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-brand-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-mid focus:border-brand-mid bg-brand-dark-card text-gray-200";
  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    <div className="min-h-screen bg-brand-dark-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-brand-dark-card rounded-2xl shadow-xl p-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <Logo className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Bolsão de Ideias</h1>
          <p className="text-gray-300 mt-2">{isLoginView ? 'Acesse sua conta para continuar' : 'Crie uma conta para começar'}</p>
        </div>
        
        <div className="flex justify-center border-b border-brand-dark-border">
          <button onClick={() => setIsLoginView(true)} className={`px-6 py-2 text-lg font-semibold transition-colors focus:outline-none ${isLoginView ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>
            Login
          </button>
          <button onClick={() => setIsLoginView(false)} className={`px-6 py-2 text-lg font-semibold transition-colors focus:outline-none ${!isLoginView ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>
            Registrar
          </button>
        </div>

        {isLoading ? (
            <Loader text={isLoginView ? 'Entrando...' : 'Criando conta...'} />
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
                <div>
                <label htmlFor="name" className={labelClasses}>Nome</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={inputClasses} />
                </div>
            )}
            <div>
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <label htmlFor="password"className={labelClasses}>Senha</label>
                <div className="relative mt-1">
                    <input 
                        type={isPasswordVisible ? 'text' : 'password'} 
                        id="password" 
                        value={password} 
                        onChange={handlePasswordChange} 
                        required 
                        className={`${inputClasses} pr-10`}
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-white focus:outline-none"
                        aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {isPasswordVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-2.145-2.145" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {!isLoginView && (
                    <div className="text-xs mt-2 space-y-1">
                        <PasswordCriterion isValid={passwordCriteria.minLength} text="Mínimo de 8 caracteres" />
                        <PasswordCriterion isValid={passwordCriteria.hasLowercase} text="Pelo menos uma letra minúscula" />
                        <PasswordCriterion isValid={passwordCriteria.hasUppercase} text="Pelo menos uma letra maiúscula" />
                        <PasswordCriterion isValid={passwordCriteria.hasNumber} text="Pelo menos um número" />
                        <PasswordCriterion isValid={passwordCriteria.hasSpecialChar} text="Pelo menos um caractere especial (!@#$...)" />
                    </div>
                )}
            </div>

            {error && <p className="text-gray-300 text-sm text-center font-semibold bg-gray-500/10 p-3 rounded-md">{error}</p>}

            <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-gray-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark-bg focus:ring-white disabled:opacity-50">
                {isLoginView ? 'Entrar' : 'Criar Conta'}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
