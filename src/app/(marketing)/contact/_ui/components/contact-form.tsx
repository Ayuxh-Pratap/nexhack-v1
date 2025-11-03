import React from 'react'
import Wrapper from "@/components/global/wrapper"
import Container from "@/components/global/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadIcon } from "lucide-react"

const ContactForm = () => {
    return (
        <div className="w-full pb-16 lg:pb-24">
            <Wrapper>
                <Container delay={0.1}>
                    <div className="flex flex-col lg:items-center lg:justify-center">
                        <h2 className="text-2xl lg:text-3xl font-semibold text-left lg:text-center">
                            Contact Us
                        </h2>
                    </div>
                </Container>

                <Container delay={0.2}>
                    <form className="max-w-3xl mx-auto w-full mt-10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">
                                    First Name*
                                </Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    className="bg-[#0A0A0A] border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">
                                    Last Name*
                                </Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    className="bg-[#0A0A0A] border-border/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">
                                Subject*
                            </Label>
                            <Input
                                id="subject"
                                placeholder="Type your subject here"
                                className="bg-[#0A0A0A] border-border/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="workEmail">
                                Work Email*
                            </Label>
                            <Input
                                id="workEmail"
                                type="email"
                                placeholder="johndoe@example.com"
                                className="bg-[#0A0A0A] border-border/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">
                                How can we help you?*
                            </Label>
                            <Textarea
                                id="message"
                                placeholder="Type your message here..."
                                className="min-h-[150px] bg-[#0A0A0A] border-border/50 resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center gap-2 px-4 py-8 rounded-lg border border-dashed border-border/50 bg-[#0A0A0A] cursor-pointer"
                            >
                                <UploadIcon className="size-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Drop your files here or click to upload
                                </span>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <Button className="w-full">
                            Submit
                        </Button>
                    </form>
                </Container>
            </Wrapper>
        </div>
    )
};

export default ContactForm
