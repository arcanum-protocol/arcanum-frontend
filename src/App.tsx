import { useChainId, useSwitchChain } from "wagmi";
import {
    Gem,
    Tractor,
    User
} from "lucide-react";
import { useCookies } from "react-cookie";
import {
    Avatar,
    ChainIcon,
    ConnectKitButton,
} from "connectkit";
import { Link, Outlet } from "react-router-dom";
import { getSVG } from "./lib/svg-adapter";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import "../app/globals.css";
import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Separator } from "@radix-ui/react-separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { useToast } from "./components/ui/use-toast";


const ConnectWallet = () => {
    return (
        <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, address }) => {
                return (
                    <>
                        <button onClick={show} className="flex border h-9 rounded bg-[#0c0a09] px-2 gap-2 items-center justify-center whitespace-nowrap">
                            {address ? <Avatar address={address} size={24} /> : <></>}
                            {isConnected ? truncatedAddress : "Connect Wallet"}
                        </button>
                    </>
                );
            }}
        </ConnectKitButton.Custom>
    );
};

function App() {
    return (
        <main className="xl:w-[1280px] lg:w-[960px] md:w-[720px] sm:w-[540px] w-full mx-auto xl:px-4 shrink-0 text-white">
            <Toaster />
            <Navbar />
            <Outlet />
        </main>
    );
}

function ArcanumChainIcon() {
    const chainId = useChainId();
    const { chains, switchChain } = useSwitchChain();

    const currentChain = chains.find((chain) => chain.id === chainId);

    if (!chains[0]) {
        return <div />;
    }

    const env = import.meta.env.VITE_ENVIRONMENT;
    
    let _chains = [...chains];

    if (env === "production") {
        _chains = chains.filter((chain) => chain.id !== 31337);
    }

    return (
        <Select onValueChange={(value) => {
            switchChain({ chainId: parseInt(value) });
        }}>
            <SelectTrigger className="w-full rounded gap-2">
                <ChainIcon id={currentChain?.id} size={25} />
                <p className="text-[0px] sm:text-base">{currentChain?.name}</p>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {
                        _chains.map((chain) => {
                            return (
                                <SelectItem value={chain.id.toString()}>
                                    <div className="flex gap-2 items-center">
                                        <ChainIcon id={chain.id} size={25} />
                                        <p>{chain.name}</p>
                                    </div>
                                </SelectItem>
                            );
                        })
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

function Navbar() {
    const [cookies, setCookie] = useCookies(['is-admin']);
    const { toast } = useToast();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEntered, setIsEntered] = useState(false);
    const [konamiCode, setKonamiCode] = useState<string>("");

    // here we sub for key inputs and wait for konami code

    function ArcanumIcon() {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            setKonamiCode((prev) => prev.concat(key));
        };

        useEffect(() => {
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, []);

        useEffect(() => {
            const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
            const konamiCodeLength = konamiSequence.join('').length;
            let isKonamiCode = konamiCode.slice(-konamiCodeLength).toLowerCase() === konamiSequence.join('');

            if (isKonamiCode) {
                toast({
                    title: "Konami Code",
                    description: "You've entered the Konami Code!",
                });
                setIsEntered(true);
                // write cookie
                setCookie('is-admin', "true", { path: '/' });

                // dont need to call this anymore
                setKonamiCode("");
                window.removeEventListener('keydown', handleKeyDown);
            }
        }, [konamiCode]);

        if (isEntered || cookies['is-admin']) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div>
                            <img src={getSVG("logo")} alt="Logo" className="w-8" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <Link to="/admin/accounts">
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Accounts
                            </DropdownMenuItem>
                        </Link>

                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link to="/admin/farmsadmin">
                                <DropdownMenuItem>
                                    <Tractor className="mr-2 h-4 w-4" />
                                    <span>Farm Maker</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link to="/admin/mpadmin">
                                <DropdownMenuItem>
                                    <Gem className="mr-2 h-4 w-4" />
                                    <span>ETF Maker</span>
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                        <DropdownMenuItem>
                            <span>ENV {import.meta.env.VITE_ENVIRONMENT}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <img src={getSVG("logo")} alt="Logo" className="w-8" />
        );
    }

    return (
        // prevent scrolling when menu is open
        <div className={`z-50 flex flex-row min-w-full justify-between sticky items-center mb-2 top-0 bg-[#0c0a09] border rounded px-4 py-2`}>
            <div className={`xl:hidden`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>
            <div className={`fixed flex flex-row top-0 left-0 w-full h-full z-40 transform transition-transform duration-300 ${isMenuOpen ? "-translate-x-0" : "-translate-x-full"}`}>
                <div className="z-50 flex w-3/4 text-left flex-col items-end h-full p-4 border bg-[#0c0a09]">
                    <div className="w-full flex justify-between items-center mb-4">
                        <div className="w-6 h-6" onClick={() => setIsMenuOpen(false)}>
                            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </div>
                        <ArcanumIcon />
                    </div>

                    <Link to="/arbi" className="w-full hover:bg-[#2D2D2D]/90 rounded ">
                        <div className="w-full text-left text-base md:text-xl py-2 px-2 inline-flex gap-2 items-center" onClick={() => setIsMenuOpen(false)}>
                            <img src={'/multipools/ARBI.svg'} alt="Arbi" className="w-5 h-5" />
                            ARBI
                        </div>
                    </Link>

                    <Link to="/spi" className="w-full hover:bg-[#2D2D2D]/90 rounded">
                        <div className="w-full text-left text-base md:text-xl py-2 px-2 inline-flex gap-2 items-center" onClick={() => setIsMenuOpen(false)}>
                            <img src={'/multipools/SPI.svg'} alt="Spi" className="w-5 h-5" />
                            SPI
                        </div>
                    </Link>

                    <Separator orientation="horizontal" className="w-full h-[1px] bg-[#2b2b2b] my-[0.5rem]" />

                    <Link to='/farms' className="w-full hover:bg-[#2D2D2D]/90 rounded">
                        <div className="w-full text-left text-base md:text-xl py-2 px-2 inline-flex gap-2 items-center" onClick={() => setIsMenuOpen(false)}>
                            <div className="grayscale">🌿</div>
                            Farming
                        </div>
                    </Link>

                    <Separator orientation="horizontal" className="w-full h-[1px] bg-[#2b2b2b] my-[0.5rem]" />

                    <Link to="https://dune.com/badconfig/arcanum" className="w-full hover:bg-[#2D2D2D]/90 rounded">
                        <div className="w-full text-left text-base md:text-xl py-2 px-2 inline-flex gap-2 items-center" onClick={() => setIsMenuOpen(false)}>
                            <img src={'/dune.svg'} alt="Spi" className="w-4 h-4" />
                            Dune
                        </div>
                    </Link>

                    <Link to="https://twitter.com/0xArcanum" className="w-full hover:bg-[#2D2D2D]/90 rounded">
                        <div className="w-full text-left text-base md:text-xl py-2 px-2 inline-flex gap-2 items-center" onClick={() => setIsMenuOpen(false)}>
                            <img src={'/x.svg'} alt="Spi" className="w-4 h-4" />
                            Twitter
                        </div>
                    </Link>

                    <Link to="https://discord.gg/nqJfDgtx82" className="w-full hover:bg-[#2D2D2D]/90 rounded">
                        <div className="w-full text-left text-base md:text-xl py-2 px-2 inline-flex gap-2 items-center" onClick={() => setIsMenuOpen(false)}>
                            <img src={'/discord.svg'} alt="Spi" className="w-4 h-4" />
                            Discord
                        </div>
                    </Link>

                    <div className="w-full text-left text-base md:text-xl py-2 px-2 inline-flex gap-2 items-center" onClick={() => {
                        setIsMenuOpen(false);

                        setTimeout(() => {
                            window.location.href = "https://docs.arcanum.to/overview/about";
                        }, 300);
                    }}>
                        <img src={'/docs.svg'} alt="Spi" className="w-4 h-4" />
                        DOCS
                    </div>

                    <div className="w-3/4">

                    </div>
                </div>
                <div className="z-40 w-1/4 h-full bg-transparent" onClick={() => setIsMenuOpen(false)}>
                </div>
            </div>
            <div className="hidden xl:block">
                <ArcanumIcon />
            </div>
            <NavigationMenu className={"hidden xl:block"}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link to='/spi' className={navigationMenuTriggerStyle()}>
                            Sharpe Portfolio Index
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link to='/arbi' className={navigationMenuTriggerStyle()}>
                            Arbitrum Index
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link to='/farms' className={navigationMenuTriggerStyle()}>
                            Farming
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Socials</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid gap-3 p-4 md:grid-cols-1 w-32">
                                <NavigationMenuLink>
                                    <a href='https://twitter.com/0xArcanum'>
                                        <div className="flex gap-2">
                                            <div className="w-5 h-5">
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.23336 4.69629C7.23336 2.96884 8.63335 1.56857 10.36 1.56857C11.3736 1.56857 12.183 2.04804 12.7254 2.74385C13.3079 2.62467 13.8557 2.40913 14.3513 2.11508C14.1559 2.72598 13.7424 3.2396 13.2033 3.56463C13.2038 3.56568 13.2042 3.56674 13.2047 3.56779C13.7334 3.50361 14.2364 3.36302 14.7048 3.15546L14.7037 3.15715C14.3667 3.66183 13.9431 4.10736 13.4561 4.47034C13.4823 4.64672 13.4956 4.82427 13.4956 5.00079C13.4956 8.6871 10.6873 12.9746 5.52122 12.9746C3.93906 12.9746 2.46544 12.511 1.22505 11.7152C0.992632 11.5661 0.925108 11.2568 1.07423 11.0244C1.0874 11.0038 1.10183 10.9846 1.11734 10.9666C1.20582 10.8202 1.37438 10.7309 1.5554 10.7522C2.47066 10.8601 3.38568 10.7485 4.19219 10.3962C3.39226 10.0434 2.77129 9.35975 2.50204 8.51974C2.45359 8.3686 2.48835 8.20311 2.59351 8.08422C2.59716 8.0801 2.60087 8.07606 2.60464 8.0721C1.96391 7.50819 1.55973 6.68208 1.55973 5.76143V5.72759C1.55973 5.56814 1.64411 5.42059 1.78155 5.33974C1.82671 5.31317 1.87537 5.29511 1.92532 5.28558C1.70549 4.86154 1.58116 4.37984 1.58116 3.86958C1.58116 3.40165 1.58384 2.81192 1.91332 2.28081C1.98718 2.16175 2.10758 2.08915 2.2364 2.07195C2.42588 2.01237 2.64087 2.06969 2.77406 2.23302C3.86536 3.57126 5.44066 4.49583 7.23366 4.73961L7.23336 4.69629ZM5.52122 11.9746C4.73387 11.9746 3.97781 11.8435 3.27248 11.6023C4.13012 11.4538 4.95307 11.1159 5.66218 10.5602C5.81211 10.4427 5.87182 10.2435 5.81126 10.0629C5.7507 9.88234 5.583 9.75943 5.39255 9.75607C4.68968 9.74366 4.06712 9.39716 3.67793 8.86845C3.86828 8.85306 4.05428 8.82039 4.23445 8.77167C4.43603 8.71716 4.57363 8.53114 4.56674 8.32243C4.55985 8.11372 4.41029 7.93718 4.20555 7.89607C3.42694 7.73977 2.79883 7.16764 2.56169 6.42174C2.76255 6.47025 2.97102 6.4991 3.18482 6.5061C3.38563 6.51267 3.56646 6.38533 3.62795 6.19405C3.68943 6.00277 3.61666 5.79391 3.44963 5.68224C2.86523 5.29155 2.48116 4.62464 2.48116 3.86958C2.48116 3.70213 2.48352 3.55268 2.49355 3.41719C3.85115 4.79913 5.70873 5.68931 7.77588 5.79338C7.93225 5.80126 8.08328 5.73543 8.18395 5.61553C8.28463 5.49562 8.32332 5.33548 8.28851 5.18284C8.25255 5.02517 8.23336 4.86284 8.23336 4.69629C8.23336 3.52085 9.18591 2.56857 10.36 2.56857C11.5943 2.56857 12.4956 3.71208 12.4956 5.00079C12.4956 8.25709 10.0202 11.9746 5.52122 11.9746Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                                            </div>
                                            Twitter
                                        </div>
                                    </a>
                                </NavigationMenuLink>
                                <NavigationMenuLink href='https://discord.gg/nqJfDgtx82'>
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.07451 1.82584C5.03267 1.81926 4.99014 1.81825 4.94803 1.82284C4.10683 1.91446 2.82673 2.36828 2.07115 2.77808C2.02106 2.80525 1.97621 2.84112 1.93869 2.88402C1.62502 3.24266 1.34046 3.82836 1.11706 4.38186C0.887447 4.95076 0.697293 5.55032 0.588937 5.98354C0.236232 7.39369 0.042502 9.08728 0.0174948 10.6925C0.0162429 10.7729 0.0351883 10.8523 0.0725931 10.9234C0.373679 11.496 1.02015 12.027 1.66809 12.4152C2.32332 12.8078 3.08732 13.1182 3.70385 13.1778C3.85335 13.1922 4.00098 13.1358 4.10282 13.0255C4.2572 12.8581 4.5193 12.4676 4.71745 12.1643C4.80739 12.0267 4.89157 11.8953 4.95845 11.7901C5.62023 11.9106 6.45043 11.9801 7.50002 11.9801C8.54844 11.9801 9.37796 11.9107 10.0394 11.7905C10.1062 11.8957 10.1903 12.0269 10.2801 12.1643C10.4783 12.4676 10.7404 12.8581 10.8947 13.0255C10.9966 13.1358 11.1442 13.1922 11.2937 13.1778C11.9102 13.1182 12.6742 12.8078 13.3295 12.4152C13.9774 12.027 14.6239 11.496 14.925 10.9234C14.9624 10.8523 14.9813 10.7729 14.9801 10.6925C14.9551 9.08728 14.7613 7.39369 14.4086 5.98354C14.3003 5.55032 14.1101 4.95076 13.8805 4.38186C13.6571 3.82836 13.3725 3.24266 13.0589 2.88402C13.0214 2.84112 12.9765 2.80525 12.9264 2.77808C12.1708 2.36828 10.8907 1.91446 10.0495 1.82284C10.0074 1.81825 9.96489 1.81926 9.92305 1.82584C9.71676 1.85825 9.5391 1.96458 9.40809 2.06355C9.26977 2.16804 9.1413 2.29668 9.0304 2.42682C8.86968 2.61544 8.71437 2.84488 8.61428 3.06225C8.27237 3.03501 7.90138 3.02 7.5 3.02C7.0977 3.02 6.72593 3.03508 6.38337 3.06244C6.28328 2.84501 6.12792 2.61549 5.96716 2.42682C5.85626 2.29668 5.72778 2.16804 5.58947 2.06355C5.45846 1.96458 5.2808 1.85825 5.07451 1.82584ZM11.0181 11.5382C11.0395 11.5713 11.0615 11.6051 11.0838 11.6392C11.2169 11.843 11.3487 12.0385 11.4508 12.1809C11.8475 12.0916 12.352 11.8818 12.8361 11.5917C13.3795 11.2661 13.8098 10.8918 14.0177 10.5739C13.9852 9.06758 13.7993 7.50369 13.4773 6.21648C13.38 5.82759 13.2038 5.27021 12.9903 4.74117C12.7893 4.24326 12.5753 3.82162 12.388 3.5792C11.7376 3.24219 10.7129 2.88582 10.0454 2.78987C10.0308 2.79839 10.0113 2.81102 9.98675 2.82955C9.91863 2.881 9.84018 2.95666 9.76111 3.04945C9.71959 3.09817 9.68166 3.1471 9.64768 3.19449C9.953 3.25031 10.2253 3.3171 10.4662 3.39123C11.1499 3.6016 11.6428 3.89039 11.884 4.212C12.0431 4.42408 12.0001 4.72494 11.788 4.884C11.5759 5.04306 11.2751 5.00008 11.116 4.788C11.0572 4.70961 10.8001 4.4984 10.1838 4.30877C9.58933 4.12585 8.71356 3.98 7.5 3.98C6.28644 3.98 5.41067 4.12585 4.81616 4.30877C4.19988 4.4984 3.94279 4.70961 3.884 4.788C3.72494 5.00008 3.42408 5.04306 3.212 4.884C2.99992 4.72494 2.95694 4.42408 3.116 4.212C3.35721 3.89039 3.85011 3.6016 4.53383 3.39123C4.77418 3.31727 5.04571 3.25062 5.35016 3.19488C5.31611 3.14738 5.27808 3.09831 5.23645 3.04945C5.15738 2.95666 5.07893 2.881 5.01081 2.82955C4.98628 2.81102 4.96674 2.79839 4.95217 2.78987C4.28464 2.88582 3.25999 3.24219 2.60954 3.5792C2.42226 3.82162 2.20825 4.24326 2.00729 4.74117C1.79376 5.27021 1.61752 5.82759 1.52025 6.21648C1.19829 7.50369 1.01236 9.06758 0.97986 10.5739C1.18772 10.8918 1.61807 11.2661 2.16148 11.5917C2.64557 11.8818 3.15003 12.0916 3.5468 12.1809C3.64885 12.0385 3.78065 11.843 3.9138 11.6392C3.93626 11.6048 3.95838 11.5708 3.97996 11.5375C3.19521 11.2591 2.77361 10.8758 2.50064 10.4664C2.35359 10.2458 2.4132 9.94778 2.63377 9.80074C2.85435 9.65369 3.15236 9.71329 3.29941 9.93387C3.56077 10.3259 4.24355 11.0201 7.50002 11.0201C10.7565 11.0201 11.4392 10.326 11.7006 9.93386C11.8477 9.71329 12.1457 9.65369 12.3663 9.80074C12.5869 9.94779 12.6465 10.2458 12.4994 10.4664C12.2262 10.8762 11.8041 11.2598 11.0181 11.5382ZM4.08049 7.01221C4.32412 6.74984 4.65476 6.60162 5.00007 6.59998C5.34538 6.60162 5.67603 6.74984 5.91966 7.01221C6.16329 7.27459 6.30007 7.62974 6.30007 7.99998C6.30007 8.37021 6.16329 8.72536 5.91966 8.98774C5.67603 9.25011 5.34538 9.39833 5.00007 9.39998C4.65476 9.39833 4.32412 9.25011 4.08049 8.98774C3.83685 8.72536 3.70007 8.37021 3.70007 7.99998C3.70007 7.62974 3.83685 7.27459 4.08049 7.01221ZM9.99885 6.59998C9.65354 6.60162 9.3229 6.74984 9.07926 7.01221C8.83563 7.27459 8.69885 7.62974 8.69885 7.99998C8.69885 8.37021 8.83563 8.72536 9.07926 8.98774C9.3229 9.25011 9.65354 9.39833 9.99885 9.39998C10.3442 9.39833 10.6748 9.25011 10.9184 8.98774C11.1621 8.72536 11.2989 8.37021 11.2989 7.99998C11.2989 7.62974 11.1621 7.27459 10.9184 7.01221C10.6748 6.74984 10.3442 6.60162 9.99885 6.59998Z" fill="currentColor"></path></svg>
                                        </div>
                                        Discord
                                    </div>
                                </NavigationMenuLink>
                                <NavigationMenuLink href='https://dune.com/badconfig/arcanum'>
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_12_16)">
                                                    <path d="M15.2749 7.64168L1.98832 12.1133M15.2836 7.99989C15.2836 12.0225 12.0226 15.2835 8 15.2835C3.97738 15.2835 0.716415 12.0225 0.716415 7.99989C0.716415 3.97728 3.97738 0.716309 8 0.716309C12.0226 0.716309 15.2836 3.97728 15.2836 7.99989Z" stroke="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_12_16">
                                                        <rect width="16" height="16" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>

                                        </div>
                                        Dune
                                    </div>
                                </NavigationMenuLink>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href='https://docs.arcanum.to' className={navigationMenuTriggerStyle()}>
                            Documentation
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex flex-row justify-center items-center gap-3">
                <ArcanumChainIcon />
                <ConnectWallet />
            </div>
        </div>
    );
}

export { App };
