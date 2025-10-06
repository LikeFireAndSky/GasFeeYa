import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    rules: {
      // ✅ any 허용
      "@typescript-eslint/no-explicit-any": "off",
      // (선택) 타입 명시 안 한 함수 허용
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];

export default eslintConfig;
