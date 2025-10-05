import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

export interface AuthError {
  code: string;
  message: string;
}

export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: unknown) {
    const firebaseError = error as { code: string };
    const authError: AuthError = {
      code: firebaseError.code,
      message: getErrorMessage(firebaseError.code),
    };
    throw authError;
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    // Adicionar escopo para obter informações básicas do perfil
    provider.addScope("profile");
    provider.addScope("email");

    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: unknown) {
    const firebaseError = error as { code: string };
    const authError: AuthError = {
      code: firebaseError.code,
      message: getGoogleErrorMessage(firebaseError.code),
    };
    throw authError;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-disabled":
      return "Conta desabilitada.";
    case "auth/too-many-requests":
      return "Muitas tentativas de login. Tente novamente mais tarde.";
    case "auth/invalid-credential":
      return "Credenciais inválidas.";
    default:
      return "Erro ao fazer login. Tente novamente.";
  }
};

const getGoogleErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/popup-closed-by-user":
      return "Login cancelado pelo usuário.";
    case "auth/popup-blocked":
      return "Pop-up bloqueado pelo navegador. Permita pop-ups e tente novamente.";
    case "auth/cancelled-popup-request":
      return "Solicitação de login cancelada.";
    case "auth/account-exists-with-different-credential":
      return "Já existe uma conta com este e-mail usando um método de login diferente.";
    case "auth/user-disabled":
      return "Conta desabilitada.";
    case "auth/operation-not-allowed":
      return "Login com Google não está habilitado.";
    default:
      return "Erro ao fazer login com Google. Tente novamente.";
  }
};
