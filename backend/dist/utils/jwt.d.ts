import { SignOptions } from 'jsonwebtoken';
export interface JwtPayload {
    userId: string;
    email: string;
}
export declare function signJwt(payload: JwtPayload, options?: SignOptions): string;
export declare function verifyJwt<T = JwtPayload>(token: string): T | null;
//# sourceMappingURL=jwt.d.ts.map