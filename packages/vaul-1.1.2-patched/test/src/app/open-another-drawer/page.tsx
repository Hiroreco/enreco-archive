"use client";

import { Drawer } from "vaul";
import { useState } from "react";

export function MyDrawer({
    open,
    setOpen,
    setOpen2,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    setOpen2: (open: boolean) => void;
}) {
    return (
        <Drawer.Root open={open}>
            <Drawer.Trigger asChild onClick={() => setOpen(true)}>
                <button>Open Drawer</button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0">
                    <div className="p-4 bg-white rounded-t-[10px] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
                        <div className="max-w-md mx-auto">
                            <Drawer.Title className="font-medium mb-4">
                                Unstyled drawer for React.
                            </Drawer.Title>

                            <button
                                type="button"
                                onClick={() => {
                                    setOpen2(true);
                                    setOpen(false);
                                }}
                                className="rounded-md mb-6 w-full bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                            >
                                Open new drawer and close this
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-zinc-100 border-t border-zinc-200 mt-auto">
                        <div className="flex gap-6 justify-end max-w-md mx-auto">
                            <a
                                className="text-xs text-zinc-600 flex items-center gap-0.25"
                                href="https://github.com/emilkowalski/vaul"
                                target="_blank"
                            >
                                GitHub
                                <svg
                                    fill="none"
                                    height="16"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                    width="16"
                                    aria-hidden="true"
                                    className="w-3 h-3 ml-1"
                                >
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                                    <path d="M15 3h6v6"></path>
                                    <path d="M10 14L21 3"></path>
                                </svg>
                            </a>
                            <a
                                className="text-xs text-zinc-600 flex items-center gap-0.25"
                                href="https://twitter.com/emilkowalski_"
                                target="_blank"
                            >
                                Twitter
                                <svg
                                    fill="none"
                                    height="16"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                    width="16"
                                    aria-hidden="true"
                                    className="w-3 h-3 ml-1"
                                >
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                                    <path d="M15 3h6v6"></path>
                                    <path d="M10 14L21 3"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

export function MyDrawer2({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    return (
        <Drawer.Root open={open}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0">
                    <div className="p-4 bg-white rounded-t-[10px] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
                        <div className="max-w-md mx-auto">
                            <Drawer.Title className="font-medium mb-4">
                                Unstyled drawer for React.
                            </Drawer.Title>
                            <p className="text-zinc-600 mb-2">
                                This component can be used as a replacement for
                                a Dialog on mobile and tablet devices.
                            </p>
                            <p className="text-zinc-600 mb-6">
                                It uses{" "}
                                <a
                                    href="https://www.radix-ui.com/docs/primitives/components/dialog"
                                    className="underline"
                                    target="_blank"
                                >
                                    Radix&rsquo;s Dialog primitive
                                </a>{" "}
                                under the hood and is inspired by{" "}
                                <a
                                    href="https://twitter.com/devongovett/status/1674470185783402496"
                                    className="underline"
                                    target="_blank"
                                >
                                    this tweet.
                                </a>
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                }}
                                className="rounded-md mb-6 w-full bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                            >
                                Close this
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-zinc-100 border-t border-zinc-200 mt-auto">
                        <div className="flex gap-6 justify-end max-w-md mx-auto">
                            <a
                                className="text-xs text-zinc-600 flex items-center gap-0.25"
                                href="https://github.com/emilkowalski/vaul"
                                target="_blank"
                            >
                                GitHub
                                <svg
                                    fill="none"
                                    height="16"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                    width="16"
                                    aria-hidden="true"
                                    className="w-3 h-3 ml-1"
                                >
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                                    <path d="M15 3h6v6"></path>
                                    <path d="M10 14L21 3"></path>
                                </svg>
                            </a>
                            <a
                                className="text-xs text-zinc-600 flex items-center gap-0.25"
                                href="https://twitter.com/emilkowalski_"
                                target="_blank"
                            >
                                Twitter
                                <svg
                                    fill="none"
                                    height="16"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                    width="16"
                                    aria-hidden="true"
                                    className="w-3 h-3 ml-1"
                                >
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                                    <path d="M15 3h6v6"></path>
                                    <path d="M10 14L21 3"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

export default function Home() {
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);

    return (
        <div className="bg-zinc-100 space-y-10">
            <p className="pb-[120vh] bg-zinc-600 text-white font-bold">
                scroll down
            </p>
            <MyDrawer open={open} setOpen={setOpen} setOpen2={setOpen2} />
            <MyDrawer2 open={open2} setOpen={setOpen2} />
            <p className="py-32 bg-zinc-800">scroll down</p>
        </div>
    );
}
