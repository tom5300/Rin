import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import type { FeedListResponse } from "@rin/api";
import { SettingsBadge, SettingsCard, SettingsCardBody, SettingsCardHeader, Spinner } from "@rin/ui";
import { client } from "../app/runtime";
import { Button } from "../components/button";
import { useAlert, useConfirm } from "../components/dialog";
import { useApiResource } from "../hooks/use-api-resource";
import { useSiteConfig } from "../hooks/useSiteConfig";

type FeedManageType = "normal" | "unlisted" | "draft";
type FeedListItem = FeedListResponse["data"][number];

const PAGE_SIZE = 20;

const TABS: Array<{ key: FeedManageType; labelKey: string }> = [
  { key: "normal", labelKey: "feeds_manage.published" },
  { key: "unlisted", labelKey: "unlisted" },
  { key: "draft", labelKey: "draft" },
];

const LINK_BUTTON_CLASS =
  "inline-flex h-min items-center rounded-full bg-secondary px-4 py-2 text-nowrap transition-colors bg-button t-primary hover:bg-neutral-100 dark:hover:bg-white/10";

function FeedManageEntry({
  item,
  deleting,
  onDelete,
}: {
  item: FeedListItem;
  deleting: boolean;
  onDelete: (item: FeedListItem) => void;
}) {
  const { t } = useTranslation();
  const isDraft = item.draft === 1;
  const isUnlisted = !isDraft && item.listed === 0;
  const statusKey = isDraft ? "draft" : isUnlisted ? "unlisted" : "feeds_manage.published";
  const statusTone = isDraft ? "warning" : isUnlisted ? "neutral" : "success";

  return (
    <SettingsCard>
      <SettingsCardHeader
        title={item.title ?? t("feeds_manage.untitled")}
        description={item.summary}
        badge={
          <SettingsBadge tone={statusTone}>
            {t(statusKey)}
          </SettingsBadge>
        }
      />
      <SettingsCardBody>
        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{new Date(item.createdAt).toLocaleString()}</span>
            <span>
              {t("count.pv")}: {item.pv}
            </span>
            <span>
              {t("count.uv")}: {item.uv}
            </span>
          </p>
          {item.hashtags.length > 0 ? (
            <p className="flex flex-wrap gap-x-2">
              {item.hashtags.map((tag) => (
                <Link key={tag.id} href={`/hashtag/${tag.name}`} className="text-theme hover:underline">
                  #{tag.name}
                </Link>
              ))}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href={`/feed/${item.id}`} className={LINK_BUTTON_CLASS}>
              {t("feeds_manage.view")}
            </Link>
            <Link href={`/admin/writing/${item.id}`} className={LINK_BUTTON_CLASS}>
              {t("edit")}
            </Link>
            <Button
              secondary
              title={t("delete.title")}
              disabled={deleting}
              onClick={() => onDelete(item)}
            />
          </div>
        </div>
      </SettingsCardBody>
    </SettingsCard>
  );
}

export function FeedManagePage() {
  const { t } = useTranslation();
  const siteConfig = useSiteConfig();
  const [type, setType] = useState<FeedManageType>("normal");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { showAlert, AlertUI } = useAlert();
  const { showConfirm, ConfirmUI } = useConfirm();

  const loadFeeds = useCallback(
    () => client.feed.list({ page, limit: PAGE_SIZE, type }),
    [page, type],
  );
  const { data, loading, error, reload } = useApiResource<FeedListResponse>(loadFeeds);
  const items = Array.isArray(data?.data) ? data.data : [];

  const selectTab = (next: FeedManageType) => {
    setType(next);
    setPage(1);
  };

  const handleDelete = (item: FeedListItem) => {
    showConfirm(
      t("article.delete.title"),
      t("article.delete.confirm"),
      async () => {
        setDeletingId(item.id);
        try {
          const { error: deleteError } = await client.feed.delete(item.id);
          if (deleteError) {
            showAlert(t("delete.failed$message", { message: deleteError.value }));
            return;
          }
          showAlert(t("delete.success"));
          void reload();
        } finally {
          setDeletingId(null);
        }
      },
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Helmet>
        <title>{`${t("feeds_manage.title")} - ${siteConfig.name}`}</title>
      </Helmet>

      <AlertUI />
      <ConfirmUI />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => selectTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              type === tab.key
                ? "bg-theme text-white"
                : "bg-secondary t-primary hover:bg-neutral-100 dark:hover:bg-white/5"
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-8 text-sm text-neutral-500 dark:text-neutral-400">
          <Spinner label={t("feeds_manage.loading")} />
        </div>
      ) : null}

      {error ? (
        <SettingsCard tone="danger">
          <SettingsCardHeader title={t("feeds_manage.load_failed")} description={error} />
        </SettingsCard>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <SettingsCard>
          <SettingsCardHeader
            title={t("feeds_manage.empty_title")}
            description={t("feeds_manage.empty_description")}
          />
        </SettingsCard>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <FeedManageEntry
              key={item.id}
              item={item}
              deleting={deletingId === item.id}
              onDelete={handleDelete}
            />
          ))}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              secondary
              title={t("previous")}
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("article.total$count", { count: data?.size ?? 0 })}
            </p>
            <Button
              secondary
              title={t("next")}
              disabled={!data?.hasNext || loading}
              onClick={() => setPage(page + 1)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
