import { Box } from "@material-ui/core";

export default function Footer() {
  return (
    <Box py={4} textAlign="center">
      <a
        href="https://vercel.com/?utm_source=uma%2Femp-tools"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/powered-by-vercel.svg" alt="Powered by Vercel" />
      </a>
    </Box>
  );
}
