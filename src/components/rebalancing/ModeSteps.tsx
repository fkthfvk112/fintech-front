"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useTranslation } from "react-i18next";
import { HowToDetail } from "./HowToDetail";
import type { RebalancingMode } from "./ToolModeCards";

interface ModeStepsProps {
  mode: RebalancingMode;
}

const STEP_ICONS: SvgIconComponent[] = [
  EditOutlinedIcon,
  BarChartOutlinedIcon,
  TuneOutlinedIcon,
];

export function ModeSteps({ mode }: ModeStepsProps) {
  const { t } = useTranslation("common");
  const prefix =
    mode === "basic" ? "shell.steps.basic" : "shell.steps.portfolio";

  const steps = [1, 2, 3].map((n) => ({
    n,
    label: t(`${prefix}.${n}`),
    Icon: STEP_ICONS[n - 1],
  }));

  return (
    <section aria-labelledby="howto-heading">
      <h2
        id="howto-heading"
        className="mb-5 text-left text-base font-bold text-slate-900"
      >
        {t("shell.howTo")}
      </h2>

      <ol className="flex flex-row items-start justify-between gap-2 sm:gap-6">
        {steps.map(({ n, label, Icon }) => (
          <li
            key={n}
            className="flex min-w-0 flex-1 flex-col items-center text-center"
          >
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#BFD4F8] bg-white sm:h-16 sm:w-16">
                <Icon sx={{ fontSize: 28, color: "#4A89F3" }} aria-hidden />
              </div>
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#4A89F3] text-[11px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs">
                {n}
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold leading-snug text-slate-800 sm:text-sm">
              {label}
            </p>
          </li>
        ))}
      </ol>

      <HowToDetail mode={mode} />
    </section>
  );
}
