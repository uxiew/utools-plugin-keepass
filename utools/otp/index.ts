import SteamOtp from "./steamOtp"
import SteamTimeAligner from "./steamTimeAligner"

// OTP 主要分为
// 1. TOTP(时间戳)，即可使用本程序替代 Google-Authenticator APP, 身份宝APP......
// 2. 基于HOTP(计数器)的动态口令

export * from 'otpauth';
export { SteamOtp, SteamTimeAligner }
