export interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    emailVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProfileMenuProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    userData: User | null;
    handleLogout: () => Promise<void>;
}