import { Button } from "@heroui/button";
//import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
//import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { useNavigate } from 'react-router-dom';
//import { link as linkStyles } from "@heroui/theme";
//import clsx from "clsx";
import l from "../components/l.jpg"; // logo

//import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
//import { GithubIcon, SearchIcon } from "@/components/icons";

export const GuestNavbar = () => {
  const navigate = useNavigate();

  
  
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Left - Brand & Nav Links */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
       <NavbarBrand className="gap-2">
  <Link className="flex items-center" href="/">
    <img 
      src={l} 
      alt="VaultX Logo" 
      className="w-8 h-8 object-contain" 
      style={{ minWidth: "32px" }}
    />
    <span className="ml-2 font-bold text-xl text-gray-800 dark:text-white">Zektra</span>
  </Link>
</NavbarBrand>
        
      </NavbarContent>

      {/* Right - Search, Theme, Auth Buttons */}
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
       
        <ThemeSwitch />

        <NavbarItem className="hidden md:flex gap-2">
          <Button
            className="text-sm font-normal"
            onClick={() => navigate('/login')}
            variant="light"
          >
            Login
          </Button>
          <Button
            className="text-sm font-medium"
            onClick={() => navigate('/signup')}
            color="primary"
          >
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Icons */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
         
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu>
       
        <div className="mx-4 mt-2 flex flex-col gap-2">
           
          <NavbarMenuItem>
            <Button
              fullWidth
              onClick={() => navigate('/login')}
              variant="light"
              className="justify-start"
            >
              Login
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button
              fullWidth
              onClick={() => navigate('/signup')}
              color="primary"
              className="justify-start"
            >
              Sign Up
            </Button>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};