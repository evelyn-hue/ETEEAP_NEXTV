import "framer-motion";

declare module "framer-motion" {
  interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    variants?: any;
    whileInView?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    viewport?: any;
    transition?: any;
  }

  export type Variants = {
    [key: string]: {
      [key: string]: any;
      transition?: any;
    };
  };
}
