declare const _default: {
    content: string[];
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: string;
                    secondary: string;
                    tertiary: string;
                    elevated: string;
                    hover: string;
                };
                accent: {
                    DEFAULT: string;
                    hover: string;
                    glow: string;
                    subtle: string;
                };
                text: {
                    primary: string;
                    secondary: string;
                    tertiary: string;
                    disabled: string;
                };
                border: {
                    subtle: string;
                    DEFAULT: string;
                    default: string;
                    strong: string;
                };
                success: string;
                warning: string;
                danger: string;
                info: string;
                purple: string;
                gold: string;
                orange: string;
                pink: string;
                cyan: string;
            };
            fontFamily: {
                sans: [string, string, string];
                mono: [string, string, string, string];
            };
            borderRadius: {
                sm: string;
                md: string;
                lg: string;
                xl: string;
            };
            boxShadow: {
                card: string;
                'card-hover': string;
                modal: string;
                glow: string;
            };
            keyframes: {
                'pulse-dot': {
                    '0%,100%': {
                        opacity: string;
                    };
                    '50%': {
                        opacity: string;
                    };
                };
                'fade-in': {
                    from: {
                        opacity: string;
                    };
                    to: {
                        opacity: string;
                    };
                };
                'slide-up': {
                    from: {
                        opacity: string;
                        transform: string;
                    };
                    to: {
                        opacity: string;
                        transform: string;
                    };
                };
            };
            animation: {
                'pulse-dot': string;
                'fade-in': string;
                'slide-up': string;
            };
        };
    };
    plugins: never[];
};
export default _default;
