import { SUBSECTION_HEADING_BAR_CLASS, SUBSECTION_HEADING_CLASS } from "@/constants/siteStyles";

export function SubsectionTitle({ title }: { title: string }) {
  return (
    <h3 className={SUBSECTION_HEADING_CLASS}>
      <span className={SUBSECTION_HEADING_BAR_CLASS} />
      {title}
    </h3>
  );
}
