import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { SkipLink } from "@/components/SkipLink";
import {
	AccessibilityMotionConfig,
	AccessibilityProvider,
} from "@/components/accessibility/AccessibilityProvider";
import AccessibilityPanel from "@/components/accessibility/AccessibilityPanel";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShell = () => {
	const { t } = useLanguage();
	return (
		<>
			<SkipLink />
			<main id='main' tabIndex={-1} aria-label={t("a11y.mainLabel")}>
				<Routes>
					<Route path='/' element={<Index />} />
					{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
					<Route path='*' element={<NotFound />} />
				</Routes>
			</main>
			<div className='fixed bottom-4 right-4 z-[70]'>
				<AccessibilityPanel />
			</div>
		</>
	);
};

const App = () => (
	<QueryClientProvider client={queryClient}>
		<LanguageProvider>
			<AccessibilityProvider>
				<AccessibilityMotionConfig>
					<TooltipProvider>
						<Toaster />
						<Sonner />
						<BrowserRouter>
							<AppShell />
						</BrowserRouter>
					</TooltipProvider>
				</AccessibilityMotionConfig>
			</AccessibilityProvider>
		</LanguageProvider>
	</QueryClientProvider>
);

export default App;
