import {string} from "prop-types";


export interface JwtPayload {
    sub: number | null
}


export default function  parseJwt(token: string) : JwtPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};