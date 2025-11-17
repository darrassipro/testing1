"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { logOut } from "@/services/slices/authSlice";
import Image from "next/image";
import { gsap } from "gsap";
import LanguageSelector from "./LanguageSelector";
import Login from "../auth/Login";
import SignUp from "../auth/SignUp";
import ForgotPassword from "../auth/ForgotPassword";
import PasswordResetOTP from "../auth/PasswordResetOTP";
import ResetPassword from "../auth/ResetPassword";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useCheckAdminRightsQuery } from "@/services/api/UserApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

interface HeaderProps {
  locale: string;
  isRTL: boolean;
  onLanguageChange: (lang: "en" | "fr" | "ar") => void;
}

export default function Header({
  locale,
  isRTL,
  onLanguageChange,
}: HeaderProps) {
  const t = useTranslations();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Check admin rights from backend
  const { data: adminData } = useCheckAdminRightsQuery(undefined, {
    skip: !user, // Only run if user is logged in
  });
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const bannerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  
  // États pour le flux de réinitialisation de mot de passe
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isPasswordResetOTPOpen, setIsPasswordResetOTPOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOTPCode, setResetOTPCode] = useState('');
  
  // Prevent hydration mismatch by only checking auth after mount
  const isAuthenticated = isMounted && !!user;

  // Detect if we're on the homepage
  const isHomePage = pathname === '/' || pathname === '/en' || pathname === '/fr' || pathname === '/ar';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listens for a global event to open the login modal
  useEffect(() => {
    const handleOpenLogin = () => {
      setIsLoginOpen(true);
    };
    document.addEventListener("triggerLoginModal", handleOpenLogin);
    return () => {
      document.removeEventListener("triggerLoginModal", handleOpenLogin);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logOut());
    toast.success("Logged out successfully");
    setMenuOpen(false);
    router.push(`/${locale}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);

      // Smoothly hide the top banner on first scroll
      if (scrolled && showTopBanner && bannerRef.current) {
        gsap.to(bannerRef.current, {
          y: -50,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => setShowTopBanner(false),
        });
      }

      // Animate navbar background + blur
      if (navRef.current) {
        if (scrolled) {
          gsap.to(navRef.current, {
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            borderColor: "rgba(229,231,235,1)",
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          gsap.to(navRef.current, {
            backgroundColor: "rgba(255,255,255,0)",
            backdropFilter: "blur(0px)",
            borderColor: "rgba(255,255,255,0.1)",
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showTopBanner]);

  // When returning to top, show the banner again with animation
  useEffect(() => {
    if (!isScrolled && !showTopBanner) {
      setShowTopBanner(true);
    }
  }, [isScrolled, showTopBanner]);

  useEffect(() => {
    if (showTopBanner && bannerRef.current) {
      gsap.fromTo(
        bannerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [showTopBanner]);

  // Reusable Profile Dropdown Component
  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 overflow-hidden h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 transition-all hover:shadow-md">
          <Avatar className="h-full w-full">
            <AvatarImage 
              src={user?.profileImage} 
              alt={user?.firstName || "User"} 
              className="object-cover"
            />
            <AvatarFallback className="bg-emerald-600 text-white font-bold flex items-center justify-center text-xs md:text-sm">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white z-[100]">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs leading-none text-muted-foreground text-gray-500 truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer w-full flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>{t("header.profile") || "Profile"}</span>
          </Link>
        </DropdownMenuItem>
        {adminData?.isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer w-full flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>{t("header.admin") || "Admin"}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("header.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <nav className="fixed top-0 w-full z-50 transition-all duration-300">
        {/* Top Banner */}
        {showTopBanner && (
          <div ref={bannerRef} className={`${isHomePage ? 'border-b border-white/10' : 'bg-[#02355E]'} transition-all duration-300`}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
              <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-2 lg:gap-0">
                <p className={`hidden sm:block text-xs sm:text-sm font-normal text-center lg:text-left ${isHomePage ? 'text-white' : 'text-white'}`}>
                  Explore Fez like never before —{" "}
                  <a
                    href="#"
                    className="underline hover:opacity-80 transition"
                  >
                    Download the GO-FEZ App today!
                  </a>
                </p>
                <p className={`sm:hidden text-xs font-normal text-center ${isHomePage ? 'text-white' : 'text-white'}`}>
                  <a
                    href="#"
                    className="underline hover:opacity-80 transition"
                  >
                    Download the GO-FEZ App today!
                  </a>
                </p>
                <div className="hidden lg:flex items-center gap-2 sm:gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] flex items-center justify-center hover:scale-105 transition-transform">
                    <i className={`fab fa-facebook-f ${isHomePage ? 'text-[#02355E]' : 'text-[#02355E]'}`} style={{ fontSize: '13px' }}></i>
                  </a>
                  <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] flex items-center justify-center hover:scale-105 transition-transform">
                    <i className={`fab fa-telegram-plane ${isHomePage ? 'text-[#02355E]' : 'text-[#02355E]'}`} style={{ fontSize: '13px' }}></i>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] flex items-center justify-center hover:scale-105 transition-transform">
                    <i className={`fab fa-instagram ${isHomePage ? 'text-[#02355E]' : 'text-[#02355E]'}`} style={{ fontSize: '13px' }}></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div
          ref={navRef}
          className={`
          transition-all duration-300
          ${
            !isHomePage
              ? "bg-white border-b border-gray-200"
              : isScrolled
              ? "border-b border-gray-200 bg-white/90 backdrop-blur-lg"
              : "border-b border-white/10 bg-transparent"
          }
        `}
        >
          <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-[56px] sm:h-[60px] md:h-[70px]">
              
              {/* Mobile layout only (up to md) */}
              <div className="flex md:hidden justify-between items-center w-full">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`p-2 ${(isHomePage && !isScrolled) ? 'text-white' : 'text-black'}`}
                >
                  {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex-1 flex justify-center">
                  <div onClick={() => router.push(`/${locale}`)} role="button" tabIndex={0} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer">
                    <Image
                      src={(isHomePage && !isScrolled) ? "/images/logo.png" : "/images/logo-nonhomepage.png"}
                      alt="GO-FEZ Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                {isAuthenticated ? (
                  <div className="flex items-center">
                    <ProfileDropdown />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignUpOpen(true)}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-emerald-600 text-white rounded-tr-[20px] rounded-bl-[20px] hover:bg-emerald-700 transition font-semibold"
                  >
                    {t("auth.signup")}
                  </button>
                )}
              </div>

              {/* Medium & large screens */}
              <div className="hidden md:flex items-center justify-between w-full relative px-2 lg:px-6">
                <div className="flex items-center gap-3 md:gap-4 lg:gap-[33px]">
                  {['home', 'routes', 'pois', 'rewards', 'partners', 'contact'].map((key) => (
                    <a
                      key={key}
                      href={key === 'home' ? '/' : `/${key}`}
                    className={`${(isHomePage && !isScrolled) ? 'text-white' : 'text-black'} hover:text-emerald-400 transition-colors duration-200 text-sm lg:text-base font-medium whitespace-nowrap`}
                    >
                      {t(`nav.${key}`)}
                    </a>
                  ))}
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <div onClick={() => router.push(`/${locale}`)} role="button" tabIndex={0} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center cursor-pointer">
                    <Image
                      src={(isHomePage && !isScrolled) ? "/images/logo.png" : "/images/logo-nonhomepage.png"}
                      alt="GO-FEZ Logo"
                      width={64}
                      height={64}
                      className="object-contain w-full h-full"
                      priority
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 lg:gap-[17px]">
                  <LanguageSelector
                    locale={locale}
                    onLanguageChange={onLanguageChange}
                  />
                  {isAuthenticated ? (
                    <div className="flex items-center ml-2">
                        {/* Display Profile Dropdown on Desktop */}
                        <ProfileDropdown />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsLoginOpen(true)}
                        className={`flex justify-center items-center w-[90px] md:w-[100px] lg:w-[110px] py-1.5 md:py-2 lg:py-[13px] text-xs md:text-sm lg:text-base font-semibold transition rounded-tr-[20px] rounded-bl-[20px] whitespace-nowrap ${
                          isHomePage
                            ? 'bg-white text-[#02355E] hover:bg-white/90'
                            : 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {t("auth.login")}
                      </button>
                      <button
                        onClick={() => setIsSignUpOpen(true)}
                        className="flex justify-center items-center w-[90px] md:w-[100px] lg:w-[110px] py-1.5 md:py-2 lg:py-[13px] text-xs md:text-sm lg:text-base font-semibold transition bg-emerald-600 text-white rounded-tr-[20px] rounded-bl-[20px] hover:bg-emerald-700 whitespace-nowrap"
                      >
                        {t("auth.signup")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        {menuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="md:hidden fixed top-0 left-0 h-full w-64 sm:w-72 bg-[#02355E] z-50 flex flex-col shadow-2xl overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="GO-FEZ Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-1">
                {['home', 'routes', 'pois', 'rewards', 'partners', 'contact'].map((key) => (
                    <a
                        key={key}
                        href={key === 'home' ? '/' : `/${key}`}
                        className="block text-white font-medium py-2.5 sm:py-3 text-sm sm:text-base hover:text-emerald-400 transition"
                    >
                        {t(`nav.${key}`)}
                    </a>
                ))}
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-t border-white/10">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    {t("header.logout")}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsSignUpOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-emerald-600 text-white rounded-tr-[20px] rounded-bl-[20px] font-semibold hover:bg-emerald-700 transition"
                    >
                      {t("auth.signup")}
                    </button>
                    <button
                      onClick={() => {
                        setIsLoginOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold border border-white/30 rounded-tr-[20px] rounded-bl-[20px] hover:bg-white/10 transition"
                    >
                      {t("auth.login")}
                    </button>
                  </>
                )}
                <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:scale-105 transition"><i className="fab fa-facebook-f text-[#02355E]" style={{ fontSize: '14px' }}></i></a>
                  <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:scale-105 transition"><i className="fab fa-telegram-plane text-[#02355E]" style={{ fontSize: '14px' }}></i></a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:scale-105 transition"><i className="fab fa-instagram text-[#02355E]" style={{ fontSize: '14px' }}></i></a>
                  <div className="ml-1">
                    <LanguageSelector
                      dropUp={true}
                      locale={locale}
                      onLanguageChange={onLanguageChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Modals */}
      {isLoginOpen && (
        <Login
          onClose={() => {
            setIsLoginOpen(false);
            document.dispatchEvent(new CustomEvent("authModalClosed")); 
          }}
          onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
          onSwitchToForgotPassword={() => { setIsLoginOpen(false); setIsForgotPasswordOpen(true); }}
        />
      )}
      {isSignUpOpen && (
        <SignUp
          onClose={() => {
            setIsSignUpOpen(false);
            document.dispatchEvent(new CustomEvent("authModalClosed")); 
          }}
          onSwitchToLogin={() => { setIsSignUpOpen(false); setIsLoginOpen(true); }}
        />
      )}
      {isForgotPasswordOpen && (
        <ForgotPassword
          onClose={() => setIsForgotPasswordOpen(false)}
          onBack={() => { setIsForgotPasswordOpen(false); setIsLoginOpen(true); }}
          onEmailSent={(email) => { setResetEmail(email); setIsForgotPasswordOpen(false); setIsPasswordResetOTPOpen(true); }}
        />
      )}
      {isPasswordResetOTPOpen && (
        <PasswordResetOTP
          email={resetEmail}
          onClose={() => setIsPasswordResetOTPOpen(false)}
          onBack={() => { setIsPasswordResetOTPOpen(false); setIsForgotPasswordOpen(true); }}
          onSuccess={(code) => { setResetOTPCode(code); setIsPasswordResetOTPOpen(false); setIsResetPasswordOpen(true); }}
        />
      )}
      {isResetPasswordOpen && (
        <ResetPassword
          email={resetEmail}
          otpCode={resetOTPCode}
          onClose={() => setIsResetPasswordOpen(false)}
          onBack={() => { setIsResetPasswordOpen(false); setIsPasswordResetOTPOpen(true); }}
        />
      )}
    </>
  );
}