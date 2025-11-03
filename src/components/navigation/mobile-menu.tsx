import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NAV_LINKS } from "@/constants"
import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"

const MobileMenu = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                    <MenuIcon className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-4">
                <SheetHeader className="sr-only">
                    <SheetTitle>
                        Menu
                    </SheetTitle> 
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                    {NAV_LINKS.map((link, index) => (
                        <SheetClose asChild key={index}>
                            <Link href={link.link} className="text-lg font-medium w-full">
                                {link.name}
                            </Link>
                        </SheetClose>
                    ))}
                    <div className="w-full mt-4">
                        <AuthButton variant="mobile" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MobileMenu 