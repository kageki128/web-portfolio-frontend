import { useCallback, useEffect, useMemo, useState } from "react";
import { getWorkIdFromHash } from "@/lib/workLink";
import type { WorkItem, WorksYearGroup } from "@/types/works";

type SelectedWorkState = {
  selectedWork: WorkItem | null;
  setSelectedWork: (work: WorkItem | null) => void;
  closeWorkModal: () => void;
};

export function useSelectedWork(
  featuredWorks: WorkItem[],
  allWorksByYear: WorksYearGroup[],
): SelectedWorkState {
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);

  const worksById = useMemo(() => {
    const map = new Map<string, WorkItem>();
    featuredWorks.forEach((work) => map.set(work.id, work));
    allWorksByYear.forEach((group) => {
      group.items.forEach((work) => map.set(work.id, work));
    });
    return map;
  }, [featuredWorks, allWorksByYear]);

  const closeWorkModal = useCallback(() => {
    setSelectedWork(null);

    const hashWorkId = getWorkIdFromHash(window.location.hash);
    if (!hashWorkId) {
      return;
    }

    const nextUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", nextUrl);
  }, []);

  useEffect(() => {
    const syncSelectedWorkFromHash = () => {
      const workId = getWorkIdFromHash(window.location.hash);
      if (!workId) {
        return;
      }

      const work = worksById.get(workId);
      if (!work) {
        return;
      }

      setSelectedWork(work);
    };

    syncSelectedWorkFromHash();
    window.addEventListener("hashchange", syncSelectedWorkFromHash);

    return () => {
      window.removeEventListener("hashchange", syncSelectedWorkFromHash);
    };
  }, [worksById]);

  useEffect(() => {
    if (!selectedWork) {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [selectedWork]);

  return {
    selectedWork,
    setSelectedWork,
    closeWorkModal,
  };
}
