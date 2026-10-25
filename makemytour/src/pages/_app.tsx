import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import store, { setUser, setAuthLoaded } from "@/store";
import { Provider } from "react-redux";
import Navbar from "@/components/Navbar";

import { useEffect } from "react";
import Footer from "@/components/Fotter";

const Myapp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    try {
      const storeduser = localStorage.getItem("user");
      if (storeduser) {
        const parsed = JSON.parse(storeduser);
        // Basic validation: must be an object with an id
        if (parsed && typeof parsed === "object" && parsed.id) {
          store.dispatch(setUser(parsed));
        } else {
          // Invalid stored data — clear it
          localStorage.removeItem("user");
          store.dispatch(setAuthLoaded());
        }
      } else {
        store.dispatch(setAuthLoaded());
      }
    } catch {
      // Corrupted JSON in localStorage — clean up
      localStorage.removeItem("user");
      store.dispatch(setAuthLoaded());
    }
  }, []);
  return (
    <div className="min-h-screen ">
      <Navbar />
      <Component {...pageProps} />
      <Footer/>
    </div>
  );
};
export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <Head>
        <title>MakeMyTour</title>
      </Head>
      <Myapp {...props} />
    </Provider>
  );
}
