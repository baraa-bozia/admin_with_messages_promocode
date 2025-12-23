import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Coupons from "./pages/Coupons";
import HeroImages from "./pages/HeroImages";
import Messages from "./pages/Messages";
import DashboardLayout from "./components/DashboardLayout";
import PromoCodes from "./pages/PromoCodes";
import RevenuePage from "./pages/RevenuePage";
import SheinProductsPage from "./pages/SheinProductsPage";
import NewProduct from "./pages/NewProduct";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/users" component={Users} />
      <Route path="/orders" component={Orders} />
      <Route path="/coupons" component={Coupons} />

      {/* <Route path="/hero-images" component={HeroImages} /> */}
       <Route path="/hero-images">
        <DashboardLayout>
          <HeroImages />
        </DashboardLayout>
      </Route>
      {/* <Route path="/messages" component={Messages} /> */}
       <Route path="/messages">
        <DashboardLayout>
          <Messages />
        </DashboardLayout>
      </Route>
      <Route path="/promo">
        <DashboardLayout>
          <PromoCodes />
        </DashboardLayout>
      </Route>
      <Route path="/revenue" component={RevenuePage } />
      <Route path="/shein-products" component={SheinProductsPage } />
      <Route path="/products" component={NewProduct } />



      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />

    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
