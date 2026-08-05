/*
 * FREONN FLOATING BUTTONS — Bold Technical Expressionism
 * Fixed bottom-right: AI chat + MAX button + phone button + scroll-to-top
 */
import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowUp } from "lucide-react";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";

const FreonnAIChat = lazy(() => import("./FreonnAIChat"));

const MAX_URL = "https://max.ru/u/f9LHodD0cOKaaN2mz0PfvjFBVqonxag-nu9wJD4VwYn1oKPsJlN6H4e2nVA";

function MaxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" className="w-7 h-7">
      <path fill="#fff" d="M350.4,9.6C141.8,20.5,4.1,184.1,12.8,390.4c3.8,90.3,40.1,168,48.7,253.7,2.2,22.2-4.2,49.6,21.4,59.3,31.5,11.9,79.8-8.1,106.2-26.4,9-6.1,17.6-13.2,24.2-22,27.3,18.1,53.2,35.6,85.7,43.4,143.1,34.3,299.9-44.2,369.6-170.3C799.6,291.2,622.5-4.6,350.4,9.6h0ZM269.4,504c-11.3,8.8-22.2,20.8-34.7,27.7-18.1,9.7-23.7-.4-30.5-16.4-21.4-50.9-24-137.6-11.5-190.9,16.8-72.5,72.9-136.3,150-143.1,78-6.9,150.4,32.7,183.1,104.2,72.4,159.1-112.9,316.2-256.4,218.6h0Z"/>
    </svg>
  );
}

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    ymGoal("scroll_to_top");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* AI Chat widget — renders its own floating button + window */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* AI Chat button (rendered inside FreonnAIChat) */}
        <Suspense fallback={null}>
          <FreonnAIChat />
        </Suspense>

        {/* MAX messenger */}
        <motion.a
          href={MAX_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { ymGoal("messenger_click", { messenger: "MAX" }); gaEvent("messenger_click", { event_category: "contact", event_label: "MAX" }); }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
          className="w-14 h-14 bg-[#1a1a3e] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 rounded-full relative"
          title="Написать в MAX"
          aria-label="Написать в MAX мессенджер"
        >
          <MaxIcon />
          {/* Pulse ring */}
          <span className="absolute inset-0 animate-ping bg-[#1a1a3e] opacity-40 rounded-full" />
        </motion.a>

        {/* Phone */}
        <motion.a
          href="tel:+78001012009"
          onClick={() => { ymGoal("phone_click"); gaEvent("phone_click", { event_category: "contact", event_label: "phone" }); }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
          className="w-14 h-14 bg-[#B91C1C] text-white flex items-center justify-center shadow-xl hover:bg-[#991818] transition-colors hover:scale-110 active:scale-95 relative rounded-full"
          title="Позвонить"
          aria-label="Позвонить по номеру 8-800-101-2009"
        >
          <Phone size={24} />
          {/* Pulse ring */}
          <span className="absolute inset-0 animate-ping bg-[#B91C1C] opacity-30 rounded-full" />
        </motion.a>

        {/* Scroll to top — появляется при скролле вниз */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              onClick={scrollToTop}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 bg-[#2D3092] text-white flex items-center justify-center shadow-lg hover:bg-[#1e2070] transition-colors hover:scale-110 active:scale-95 rounded-full"
              title="Наверх"
              aria-label="Прокрутить страницу наверх"
            >
              <ArrowUp size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
