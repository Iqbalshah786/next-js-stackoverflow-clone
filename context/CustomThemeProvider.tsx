import { ThemeProviderProps } from "next-themes";
import { ThemeProvider } from "next-themes";

const CustomThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
};

export default CustomThemeProvider;
