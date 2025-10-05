import { useState, useCallback } from "react";

interface NotFoundState {
  isNotFound: boolean;
  notFoundMessage?: string;
  notFoundTitle?: string;
}

export const useNotFound = () => {
  const [notFoundState, setNotFoundState] = useState<NotFoundState>({
    isNotFound: false,
  });

  const setNotFound = useCallback(
    (isNotFound: boolean, title?: string, message?: string) => {
      setNotFoundState({
        isNotFound,
        notFoundTitle: title,
        notFoundMessage: message,
      });
    },
    []
  );

  const resetNotFound = useCallback(() => {
    setNotFoundState({
      isNotFound: false,
    });
  }, []);

  return {
    ...notFoundState,
    setNotFound,
    resetNotFound,
  };
};

// Hook específico para recursos
export const useResourceNotFound = (resourceName: string = "recurso") => {
  const {
    isNotFound,
    setNotFound,
    resetNotFound,
    notFoundTitle,
    notFoundMessage,
  } = useNotFound();

  const setResourceNotFound = useCallback(
    (resourceId?: string) => {
      setNotFound(
        true,
        `${resourceName} não encontrado`,
        resourceId
          ? `O ${resourceName} com ID "${resourceId}" não foi encontrado ou foi removido do sistema.`
          : `O ${resourceName} solicitado não foi encontrado ou foi removido do sistema.`
      );
    },
    [resourceName, setNotFound]
  );

  return {
    isNotFound,
    notFoundTitle,
    notFoundMessage,
    setResourceNotFound,
    resetNotFound,
  };
};
