declare module "react-remita" {
  export interface RemitaPaymentConfig {
    amount: number;
    email: string;
    fullname: string;
    description?: string;
    reference: string;
    rrr?: string;
    onSuccess?: () => void;
    onError?: (error: { message?: string }) => void;
    onClose?: () => void;
  }

  export interface UseRemitaOptions {
    publicKey: string;
  }

  export interface UseRemitaReturn {
    makePayment: (config: RemitaPaymentConfig) => void;
    isProcessing: boolean;
  }

  export function useRemita(options: UseRemitaOptions): UseRemitaReturn;
}
