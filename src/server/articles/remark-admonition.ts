import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const ADMONITION_TYPES = ["info", "warning", "error", "success"] as const;
type AdmonitionType = (typeof ADMONITION_TYPES)[number];

const ADMONITION_TYPE_SET = new Set<AdmonitionType>(ADMONITION_TYPES);

type ContainerDirectiveNode = {
  type: "containerDirective";
  name?: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
};

export const remarkAdmonition: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "containerDirective", (node) => {
      const directive = node as ContainerDirectiveNode;
      const kind = directive.name;
      if (!kind || !ADMONITION_TYPE_SET.has(kind as AdmonitionType)) {
        return;
      }

      directive.data = {
        ...directive.data,
        hName: "div",
        hProperties: {
          ...directive.data?.hProperties,
          className: ["admonition", `admonition-${kind}`],
          "data-admonition": kind,
        },
      };
    });
  };
};
