declare module "qrcode" {
  type QRCodeSegment = any

  export type QRCodeToStringOptions = {
    type?: "svg" | "terminal" | "utf8" | "png" | "pdf"
    margin?: number
    scale?: number
    width?: number
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
    color?: {
      dark?: string
      light?: string
    }
    rendererOpts?: any
  }

  export function toString(text: string | QRCodeSegment[], options?: QRCodeToStringOptions): Promise<string>

  const QRCode: {
    toString: typeof toString
  }

  export default QRCode
}
