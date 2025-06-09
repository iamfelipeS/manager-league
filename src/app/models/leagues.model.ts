import { Organizer } from "./organizer.model";

export interface Leagues {
    id: string;
    name: string;
    organizer: Organizer[];
    private: boolean;
    img?:string;
}
