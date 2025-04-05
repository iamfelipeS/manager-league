import { Organizer } from "./organizer.model";

export interface Leagues {
    name: string;
    organizer: Organizer[];
    private: boolean;
    img?:string;
}
