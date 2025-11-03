import Image from "next/image";
import Container from "@/components/global/container";
import Icons from "@/components/global/icons";
import Wrapper from "@/components/global/wrapper";
import { MISSION } from "@/constants";

const OurMission = () => {
    return (
        <div className="flex flex-col items-start justify-start md:items-center md:justify-center w-full py-16 lg:py-24">
            <Wrapper>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col px-2 md:px-0 h-full">
                        <Container>
                            <div className="flex items-center justify-center gap-x-1 px-2 py-1.5 relative w-max rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
                                <Icons.stars className="size-5" />
                                <span className="text-sm text-white">
                                    Our Mission
                                </span>
                            </div>
                        </Container>
                        <Container delay={0.1}>
                            <h2 className="text-3xl md:text-4xl font-semibold text-left tracking-tight mt-4">
                                We’re on a mission to power customers
                            </h2>
                        </Container>
                        <Container delay={0.3}>
                            <p className="text-base md:text-lg text-muted-foreground text-left mt-2 max-w-2xl">
                                Every day, we work to empower businesses to grow and succeed. We’re committed to providing the best possible experience for our customers, and we’re always looking for new ways to improve.
                            </p>
                            <p className="text-base lg:text-lg font-normal text-muted-foreground mt-4">
                                From the first day we started, we’ve been committed to helping businesses grow and succeed.
                            </p>
                        </Container>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {MISSION.map((item) => (
                            <div key={item.heading} className="rounded-2xl bg-[#181818] border border-neutral-800 p-4 lg:p-6 flex flex-col justify-start">
                                <div className="size-8">
                                    <Image
                                        src={item.icon}
                                        alt={item.heading}
                                        width={1024}
                                        height={1024}
                                        className="size-full"
                                    />
                                </div>
                                <h4 className="text-lg font-semibold font-heading mt-4">
                                    {item.heading}
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper>
        </div>
    )
};

export default OurMission
