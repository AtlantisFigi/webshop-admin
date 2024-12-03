import {useStorage} from "@vueuse/core";

export type LocalUser = {
    firstName: string;
    infix: string | null;
    lastName: string;
    email: string;
}

const user = useStorage<LocalUser | null>(
    'user',
    null,
    localStorage,
    {
        mergeDefaults: true,
        serializer: {
            read: (v: any): LocalUser | null => v ? JSON.parse(atob(v)) : null,
            write: (v: any) => btoa(JSON.stringify(v)),
        },
    }
)

export default user;