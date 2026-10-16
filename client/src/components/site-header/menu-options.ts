import { useContext, useMemo } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ClientConfigContext } from "../../state/config";

export const MENU_CONFIG_KEY = "menu.items";

export type MenuNavItem = {
  label: string;
  href: string;
  visible: boolean;
};

export function buildDefaultMenuItems(t: TFunction): MenuNavItem[] {
  return [
    { label: t("article.title"), href: "/", visible: true },
    { label: t("timeline"), href: "/timeline", visible: true },
    { label: t("moments.title"), href: "/moments", visible: true },
    { label: t("hashtags"), href: "/hashtags", visible: true },
    { label: t("friends.title"), href: "/friends", visible: true },
    { label: t("about.title"), href: "/about", visible: true },
  ];
}

// 解析菜单配置。未设置或格式非法时返回 null（调用方回退内置默认菜单）。
// 保留 label/href 为空的条目，供后台编辑器继续完善；渲染侧自行过滤。
export function parseMenuItems(raw: unknown): MenuNavItem[] | null {
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
      .map((entry) => ({
        label: typeof entry.label === "string" ? entry.label.trim() : "",
        href: typeof entry.href === "string" ? entry.href.trim() : "",
        visible: entry.visible !== false,
      }));
  } catch {
    return null;
  }
}

// 渲染用的菜单项：过滤未填完整的条目；若无任何有效条目则回退内置默认菜单。
export function resolveMenuItems(raw: unknown, t: TFunction): MenuNavItem[] {
  const parsed = parseMenuItems(raw) ?? [];
  const valid = parsed.filter((item) => item.label !== "" && item.href !== "");
  return valid.length > 0 ? valid : buildDefaultMenuItems(t);
}

export function useMenuItems(): MenuNavItem[] {
  const config = useContext(ClientConfigContext);
  const { t } = useTranslation();
  const raw = config.get<unknown>(MENU_CONFIG_KEY);
  return useMemo(() => resolveMenuItems(raw, t), [raw, t]);
}
