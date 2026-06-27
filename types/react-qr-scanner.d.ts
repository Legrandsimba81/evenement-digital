declare module "react-qr-scanner" {
  import { Component } from "react";

  interface QrReaderProps {
    onResult: (result: { text: string } | null) => void;
    onError: (error: any) => void;
    constraints?: {
      facingMode?: string;
      audio?: boolean;
    };
    className?: string;
    style?: React.CSSProperties;
  }

  export default class QrReader extends Component<QrReaderProps> {}
}