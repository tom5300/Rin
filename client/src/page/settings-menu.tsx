import * as Switch from "@radix-ui/react-switch";
import { SettingsCard, SettingsCardBody, SettingsCardHeader } from "@rin/ui";
import { useTranslation } from "react-i18next";
import { Button } from "../components/button";
import { useConfirm } from "../components/dialog";
import type { MenuNavItem } from "../components/site-header/menu-options";

const INPUT_CLASS =
  "h-9 rounded-lg border border-black/10 bg-w px-3 text-sm t-primary outline-none transition-colors placeholder:text-neutral-400 focus:border-theme/40 dark:border-white/10 dark:placeholder:text-neutral-500";

export function MenuSettings({
  value,
  onChange,
}: {
  value: MenuNavItem[];
  onChange: (items: MenuNavItem[] | null) => void;
}) {
  const { t } = useTranslation();
  const { showConfirm, ConfirmUI } = useConfirm();

  function updateItem(index: number, patch: Partial<MenuNavItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) {
      return;
    }
    const next = [...value];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  function removeItem(index: number) {
    showConfirm(t("delete.title"), t("delete.confirm"), () => {
      onChange(value.filter((_, i) => i !== index));
    });
  }

  return (
    <div className="w-full">
      <SettingsCard>
        <SettingsCardHeader
          title={t("settings.menu.items.title")}
          description={t("settings.menu.items.desc")}
        />
        <SettingsCardBody>
          {value.length > 0 ? (
            <div className="flex flex-col gap-2">
              {value.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-black/5 px-3 py-2 dark:border-white/5"
                >
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label={t("settings.menu.items.move_up")}
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                      className="rounded p-0.5 text-neutral-400 transition-colors hover:text-theme disabled:opacity-30"
                    >
                      <i className="ri-arrow-up-line" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("settings.menu.items.move_down")}
                      disabled={index === value.length - 1}
                      onClick={() => moveItem(index, 1)}
                      className="rounded p-0.5 text-neutral-400 transition-colors hover:text-theme disabled:opacity-30"
                    >
                      <i className="ri-arrow-down-line" />
                    </button>
                  </div>
                  <input
                    value={item.label}
                    onChange={(event) => updateItem(index, { label: event.target.value })}
                    placeholder={t("settings.menu.items.label_placeholder")}
                    className={`${INPUT_CLASS} min-w-24 w-28 flex-1`}
                  />
                  <input
                    value={item.href}
                    onChange={(event) => updateItem(index, { href: event.target.value })}
                    placeholder={t("settings.menu.items.href_placeholder")}
                    className={`${INPUT_CLASS} min-w-40 w-48 flex-[2]`}
                  />
                  <Switch.Root
                    className="SwitchRoot"
                    checked={item.visible}
                    onCheckedChange={(checked) => updateItem(index, { visible: checked })}
                  >
                    <Switch.Thumb className="SwitchThumb" />
                  </Switch.Root>
                  <button
                    type="button"
                    aria-label={t("delete.title")}
                    onClick={() => removeItem(index)}
                    className="ml-auto rounded-lg p-2 text-neutral-400 transition-colors hover:text-rose-500"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("settings.menu.items.empty")}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Button
              secondary
              title={t("settings.menu.items.add")}
              onClick={() => onChange([...value, { label: "", href: "", visible: true }])}
            />
            <Button secondary title={t("settings.menu.items.reset")} onClick={() => onChange(null)} />
          </div>
        </SettingsCardBody>
      </SettingsCard>
      <ConfirmUI />
    </div>
  );
}
