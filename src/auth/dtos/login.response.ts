import { Wallet } from "@prisma/client";
import {Credential} from "@prisma/client";

export interface LoginResponse {
    user: {
        id: string;
        name: string;
        lastName: string;
        email: string;
        levelUser: string;
        credential?: Credential | null;
        wallet_?: Wallet | null;
        balance: number;
        isActive: boolean;
    };
    token: string;
    expiresIn: number;
}
