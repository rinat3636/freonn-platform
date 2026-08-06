declare module "cookie" {
  export interface CookieSerializeOptions {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    priority?: "low" | "medium" | "high";
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
  }

  export function parse(
    str: string,
    options?: Record<string, unknown>
  ): Record<string, string>;

  export function stringifySetCookie(
    name: string,
    val: string,
    options?: CookieSerializeOptions
  ): string;

  export function serialize(
    name: string,
    val: string,
    options?: CookieSerializeOptions
  ): string;
}
