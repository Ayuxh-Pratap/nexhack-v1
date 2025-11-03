import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className="w-full grow relative">
                <Navbar />
                {children}
                <Footer />
            </main>
        </>
    );
};
